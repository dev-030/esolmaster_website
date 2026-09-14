
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  User,
  FileText,
  Users,
  Activity,
  Zap,
  Star,
} from 'lucide-react';
import { TeacherData } from './interface';
import { formatDate, getInitials } from './UserInfos';


const Building2: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

export const TeacherDashboard: React.FC<{ data: TeacherData }> = ({ data }) => {
  const { profileCard, statCards, roleInfo, chartData, tables } = data;
  const { taskCreation, classOverview } = chartData;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profileCard.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-lg">
              {getInitials(profileCard.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profileCard.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <Badge variant="secondary" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {roleInfo.subject}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Building2 className="h-3 w-3" />
                {roleInfo.institution}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(profileCard.joinedAt)}
              </Badge>
              {profileCard.isActive && (
                <Badge variant="default" className="bg-green-500 gap-1">
                  <Activity className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{roleInfo.bio}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks Created</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {classOverview.map((classItem, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{classItem.className}</span>
                    <Badge>{classItem.subject}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Students: {classItem.students} / {classItem.maxStudents || "No limit"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={classItem.maxStudents ? (classItem.students / classItem.maxStudents) * 100 : 0} className="mb-4" />
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {classItem.tasks} Tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {classItem.students} Students
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Creation Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCreation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="taskTitle" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="questions" fill="#3b82f6" name="Questions" />
                    <Bar yAxisId="right" dataKey="attempts" fill="#10b981" name="Attempts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Created Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.recentTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>
                        <Badge variant={task.status === 'APPROVED' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.totalQuestions}</TableCell>
                      <TableCell>{task.totalAttempts}</TableCell>
                      <TableCell>{formatDate(task.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tables.classes.map((classItem) => (
                  <Card key={classItem.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: classItem.color }} />
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{classItem.name}</h3>
                      <p className="text-sm text-muted-foreground">{classItem.subject}</p>
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {classItem.totalStudents}/{classItem.maxStudents || "No limit"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {classItem.totalTasks} tasks
                        </span>
                      </div>
                      <Progress
                        value={classItem.maxStudents ? (classItem.totalStudents / classItem.maxStudents) * 100 : 0}
                        className="mt-3"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};