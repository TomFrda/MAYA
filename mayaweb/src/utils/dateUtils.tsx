export const formatLastActive = (date: Date | undefined): string => {
  if (!date) return 'Non disponible';
  
  const now = new Date();
  const lastActive = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - lastActive.getTime()) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  
  return lastActive.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
};