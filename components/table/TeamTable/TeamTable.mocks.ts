import { ITeamTable } from "./TeamTable";

const base: ITeamTable = {
  currentUser: {
    "id": "clj9cz7540000jlp0zq6k318f",
    "name": "Hasan Iqbal",
    "email": "swapniliqbal@gmail.com",
    "emailVerified": null,
    "image": "https://lh3.googleusercontent.com/a/AAcHTtfpOFZiIMNTC7pbtGRFgxjtushxIaka6wCR701zbjg=s96-c",
    "phone": null,
    "role": "Manager",

  },

  teamMembers: [
    {
      "id": "clj9cz7540000jlp0zq6k318f",
      "name": "Hasan Iqbal",
      "email": "swapniliqbal@gmail.com",
      "emailVerified": null,
      "image": "https://lh3.googleusercontent.com/a/AAcHTtfpOFZiIMNTC7pbtGRFgxjtushxIaka6wCR701zbjg=s96-c",
      "phone": null,
      "role": "Manager",

    },
    {
      "id": "clj9dt8ea0006jlp06vsnc1ve",
      "name": "Hasan Iqbal",
      "email": "hasan@foundermedia.ca",
      "emailVerified": null,
      "image": null,
      "phone": null,
      "role": "Collaborator",

    },
    {
      "id": "clj9j7dn30002r970eqhag6dy",
      "name": "Rofiq El",
      "email": "elrofiglow@gmail.com",
      "emailVerified": null,
      "image": "https://lh3.googleusercontent.com/a/AAcHTtd4ybh0ktj9xbDqTvwXELhwz1SWx9AOz-V_DSEB=s96-c",
      "phone": null,
      "role": "Collaborator",

    }
  ],
  handleRoleChange(userId, role) {
    console.log(userId, role);
  },
};

export const mockTeamTableProps = {
  base,
};
