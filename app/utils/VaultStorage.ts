export interface VaultFile {
  id: string;
  name: string;
  size: string;
  content: string;
  uploadedAt: string;
}

export const getVaultFiles = (userId: string): VaultFile[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`workspace_vault_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveVaultFile = (userId: string, file: Omit<VaultFile, "id" | "uploadedAt">): VaultFile[] => {
  const files = getVaultFiles(userId);
  const newFile: VaultFile = {
    ...file,
    id: `file-${Date.now()}`,
    uploadedAt: new Date().toLocaleDateString()
  };
  const updated = [...files, newFile];
  localStorage.setItem(`workspace_vault_${userId}`, JSON.stringify(updated));
  return updated;
};

export const deleteVaultFile = (userId: string, id: string): VaultFile[] => {
  const files = getVaultFiles(userId);
  const updated = files.filter(f => f.id !== id);
  localStorage.setItem(`workspace_vault_${userId}`, JSON.stringify(updated));
  return updated;
};
