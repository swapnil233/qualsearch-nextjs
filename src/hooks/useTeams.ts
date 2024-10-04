import { ApiResponse, TeamWithMemberCount } from '@/types';
import { useQuery, useQueryClient } from 'react-query';

const fetchTeams = async (): Promise<ApiResponse<TeamWithMemberCount[]>> => {
  const response = await fetch('/api/teams');
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error.message || 'An error occurred while fetching the data');
  }

  return json as ApiResponse<TeamWithMemberCount[]>;
};

const useTeams = () => {
  const queryClient = useQueryClient();

  const {
    data,
    error,
    isLoading,
    isError,
  } = useQuery<ApiResponse<TeamWithMemberCount[]>>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const invalidateTeams = () => {
    queryClient.invalidateQueries({
      queryKey: ['teams'],
    });
  };

  return {
    isLoading,
    isError: isError || Boolean(error),
    teams: data?.data,
    apiError: error,
    invalidateTeams,
    mutateTeams: invalidateTeams,
  };
};

export default useTeams;
