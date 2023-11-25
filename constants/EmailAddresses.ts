const domain = process.env.EMAIL_DOMAIN || "qualsearch.io";

export const EmailAddresses = {
  Noreply: `noreply@${domain}`,
  Support: `support@${domain}`,
  Sales: `sales@${domain}`,
  Abuse: `abuse@${domain}`,
  Admin: `admin@${domain}`,
  Billing: `billing@${domain}`,
  Security: `security@${domain}`,
};
