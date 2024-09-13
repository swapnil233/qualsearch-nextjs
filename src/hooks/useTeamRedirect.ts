import { useMemo } from 'react';
import useTeams from './useTeams';

const useTeamRedirect = () => {
  const { teams } = useTeams();

  const teamRedirectUrl = useMemo(() => {
    const lastCreatedTeamId = teams?.[0]?.id || '';
    return lastCreatedTeamId !== ''
      ? `/teams/${lastCreatedTeamId}/projects`
      : '/teams';
  }, [teams]);

  return teamRedirectUrl;
};

export default useTeamRedirect;
