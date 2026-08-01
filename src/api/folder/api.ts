import { axios } from "@/lib/axios";

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    children: number;
    tasks: number;
  };
};

export const createFolder = async (data: { name: string; parentId?: string }) => {
  const res = await axios.post("/folder", data);
  return res.data;
};

export const getFolders = async (parentId?: string): Promise<Folder[]> => {
  const res = await axios.get("/folder", { params: { parentId } });
  return res.data;
};

export const getFolderById = async (id: string): Promise<Folder & { children: Folder[], tasks: any[], ancestors: {id: string, name: string}[] }> => {
  const res = await axios.get(`/folder/${id}`);
  return res.data;
};

export const updateFolder = async (id: string, data: { name: string }) => {
  const res = await axios.patch(`/folder/${id}`, data);
  return res.data;
};

export const deleteFolder = async (id: string) => {
  const res = await axios.delete(`/folder/${id}`);
  return res.data;
};
