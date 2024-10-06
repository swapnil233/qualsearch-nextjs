import packageInfo from "../../package.json";

const app = {
  version: packageInfo.version,
  author: "Hasan Iqbal",
  name: "QualSearch",
  description: "Qualitative research analysis platform.",
  logoUrl: {
    dark: "/logo-dark.svg",
    light: "/logo-light.svg",
  },
  logoUrlAlt: "QualSearch logo",
};

export default app;
