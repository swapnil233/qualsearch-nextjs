import useTeams from "./useTeams";

const useTeamRedirect = () => {
    const { teams } = useTeams();
    const lastCreatedTeamId = teams?.[0]?.id || "";

    const teamRedirectUrl = lastCreatedTeamId !== "" ? `/teams/${lastCreatedTeamId}` : "/teams";

    return teamRedirectUrl;
};

export default useTeamRedirect;
