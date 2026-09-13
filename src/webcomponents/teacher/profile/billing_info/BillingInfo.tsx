"use client";

import { useState } from "react";
import { CheckCircle, Download, CreditCard, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateCheckoutSessionMutation, useGetBillingInfoQuery, useGetMySubscription, useGetSubscriptionPlans } from "@/api/payment";
import { useCreateBillingPortalSessionMutation } from "@/api/payment";
import { formatDate } from "date-fns";
import { toast } from "sonner";
;

type PlanStatus = "Active" | "Cancelled" | "Past Due" | "Trialing";

const statusBadgeVariant: Record<PlanStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  "Past Due": "bg-yellow-100 text-yellow-700",
  Trialing: "bg-blue-100 text-blue-700",
};

type BillingCycle = "MONTHLY" | "ANNUAL";

type SubscriptionPlan = {
  id: string;
  name: string;
  type: "FREE" | "BASIC" | "PRO";
  monthlyPrice: number;
  annualPrice: number;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxScheduledTasksInClass: number;
};

type MySubscription = {
  billingStatus: "ACTIVE" | "PAST_DUE" | "TRIALING" | "CANCELED";
  billingCycle: BillingCycle | null;
  boughtPrice: number;
  discountAmount: number;
  finalPrice: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
};

interface BillingRecord {
  id: string;
  date: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl: string;
  invoicePdf: string;
}


   export interface PaymentMethod {
        brand: "visa" | "mastercard" | "amex" | "discover" | "diners" | "jcb" | "unionpay" | "unknown"  ,
        last4: number,
        expMonth: number,
        expYear: number
    } 



const getCardIcon = () => {
  // You can customize this mapping with actual card brand icons
  return <CreditCard className="h-5 w-5 text-muted-foreground" />;
};

const formatExpiryDate = (month: number, year: number) => {
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
};

const formatPrice = (amount?: number | null) => {
  return `$${((amount ?? 0) / 100).toFixed(2)}`;
};

const getStatusLabel = (
  status?: MySubscription["billingStatus"]
): PlanStatus => {
  if (status === "PAST_DUE") return "Past Due";
  if (status === "TRIALING") return "Trialing";
  if (status === "CANCELED") return "Cancelled";
  return "Active";
};

const SubscriptionCard = ({ onManageBilling, isManagingBilling }: { onManageBilling: () => void; isManagingBilling: boolean }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  const { data: subscription, isLoading: isSubscriptionLoading } =
    useGetMySubscription();

  const { data: plans, isLoading: isPlansLoading } = useGetSubscriptionPlans();

  const { mutate: createCheckout, isPending } =
    useCreateCheckoutSessionMutation();

  if (isSubscriptionLoading || isPlansLoading) {
    return (
      <Card className="flex-1">
        <CardContent className="p-6">Loading subscription...</CardContent>
      </Card>
    );
  }

  const currentSubscription = subscription as MySubscription;
  const subscriptionPlans = (plans ?? []) as SubscriptionPlan[];

  const currentPlan = currentSubscription?.plan;
  const statusLabel = getStatusLabel(currentSubscription?.billingStatus);

  const displayPrice =
    currentSubscription?.billingCycle === "ANNUAL"
      ? currentPlan?.annualPrice
      : currentPlan?.monthlyPrice;

  const billingText =
    currentSubscription?.billingCycle === "ANNUAL"
      ? "/year"
      : currentSubscription?.billingCycle === "MONTHLY"
        ? "/month"
        : "/free";

  const paidPlans = subscriptionPlans.filter((plan) => plan.type !== "FREE");

  const handleCheckout = (planId: string) => {
    createCheckout(
      {
        planId,
        billingCycle,
      },
      {
        onSuccess: (data) => {
          if (data?.url) {
            window.location.href = data.url;
          }
        },
      }
    );
  };

  return (
    <Card className="flex-1">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">
            {currentPlan?.name ?? "Free"}
          </h3>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeVariant[statusLabel]}`}
          >
            {statusLabel}
          </span>
        </div>

        <div>
          <span className="text-3xl font-bold">
            {formatPrice(displayPrice)}
          </span>
          <span className="text-muted-foreground text-sm">{billingText}</span>
        </div>

        <Separator />

        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            Max Classes: {currentPlan?.maxClasses ?? 5}
          </li>

          <li className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            Students Per Class: {currentPlan?.maxStudentsPerClass ?? 10}
          </li>

          <li className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
            Scheduled Tasks Per Class:{" "}
            {currentPlan?.maxScheduledTasksInClass ?? 5}
          </li>
        </ul>

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant={billingCycle === "MONTHLY" ? "default" : "outline"}
            onClick={() => setBillingCycle("MONTHLY")}
          >
            Monthly
          </Button>

          <Button
            size="sm"
            variant={billingCycle === "ANNUAL" ? "default" : "outline"}
            onClick={() => setBillingCycle("ANNUAL")}
          >
            Annual
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {paidPlans.map((plan) => {
            const isCurrentPlan =
              currentPlan?.id === plan.id &&
              currentSubscription?.billingCycle === billingCycle;

            const price =
              billingCycle === "ANNUAL"
                ? plan.annualPrice
                : plan.monthlyPrice;

            return (
              <Button
                key={plan.id}
                size="sm"
                disabled={isPending || isCurrentPlan}
                onClick={() => handleCheckout(plan.id)}
                className="w-full"
              >
                {isCurrentPlan
                  ? "Current Plan"
                  : `${plan.name} ${formatPrice(price)}`}
              </Button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Next Billing Date:{" "}
          <span className="font-medium text-foreground">
            {currentSubscription?.currentPeriodEnd
              ? new Date(
                  currentSubscription.currentPeriodEnd
                ).toLocaleDateString()
              : "No billing date"}
          </span>
        </p>
        {currentPlan?.type !== "FREE" && (
          <Button variant="outline" size="sm" onClick={onManageBilling} disabled={isManagingBilling} className="w-full">
            Manage subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentMethodCard = ({ paymentMethod, onManageBilling, isManagingBilling }: { paymentMethod: PaymentMethod | null; onManageBilling: () => void; isManagingBilling: boolean }) => (
  <Card className="flex-1">
    <CardContent className="p-6 space-y-4">
      <h3 className="font-semibold text-base">Payment Method</h3>

      {paymentMethod ? (
        <>
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCardIcon()}
                <span className="text-sm font-medium capitalize">
                  {paymentMethod.brand}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Default
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-mono">
                •••• •••• •••• {paymentMethod.last4}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires {formatExpiryDate(paymentMethod.expMonth, paymentMethod.expYear)}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={onManageBilling} disabled={isManagingBilling}>
            Update Payment Method
          </Button>
        </>
      ) : (
        <>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center space-y-2">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No payment method added</p>
            <p className="text-xs text-muted-foreground">
              Add a payment method to start using the service
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={onManageBilling} disabled={isManagingBilling}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </>
      )}
    </CardContent>
  </Card>
);

const BillingHistoryCard = ({ billingHistory }: { billingHistory: BillingRecord[] }) => {
  const handleDownload = (invoicePdf: string, id: string) => {
    // Open the invoice PDF in a new tab or trigger download
    window.open(invoicePdf, '_blank');
    console.log("Downloading invoice:", id);
  };

  const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toLowerCase(),
  }).format(amount / 100); // Assuming amount is in cents
};


  if (!billingHistory || billingHistory.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-gray-50 rounded-t-lg px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          No billing history available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50 rounded-t-lg px-6 py-4">
        <CardTitle className="text-base font-semibold">
          Billing History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="pl-6">Date</TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6">Invoice</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {billingHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="pl-6 text-sm">
                  {formatDate(new Date(record.date), 'PPP')}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {record.plan}
                </TableCell>
                <TableCell className="text-sm">
                  {formatAmount(record.amount, record.currency)}
                </TableCell>
                <TableCell className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : record.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="pr-6">
                  <button
                    type="button"
                    onClick={() => handleDownload(record.invoicePdf, record.id)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    // title={`Download invoice for ${record.plan} - ${formatDate(record.date)}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {billingHistory.length > 5 && (
          <div className="px-6 py-4 border-t">
            {/* Add pagination here if needed */}
            <p className="text-sm text-muted-foreground text-center">
              Showing {billingHistory.length} records
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BillingInfo = () => {
  const { data: billingInfo } = useGetBillingInfoQuery();
  const { mutate: createBillingPortal, isPending: isManagingBilling } = useCreateBillingPortalSessionMutation();

  const handleManageBilling = () => {
    createBillingPortal(undefined, {
      onSuccess: (data) => {
        if (data?.url) window.location.assign(data.url);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Unable to open Stripe billing portal");
      },
    });
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionCard onManageBilling={handleManageBilling} isManagingBilling={isManagingBilling} />
        <PaymentMethodCard paymentMethod={billingInfo?.paymentMethod || null} onManageBilling={handleManageBilling} isManagingBilling={isManagingBilling} />
      </div>

      <BillingHistoryCard billingHistory={billingInfo?.billingHistory || []} />
    </div>
  );
};
