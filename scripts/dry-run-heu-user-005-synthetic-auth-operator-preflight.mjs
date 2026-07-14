const candidates = [
  ["U012", "KHTC", "FINANCE_READONLY"],
  ["U013", "TCHC", "HR_READONLY"],
  ["U014", "TUYEN_SINH", "ADMISSION_OPERATOR"],
  ["U015", "CTHSSV", "CTHSSV_OPERATOR"],
  ["U016", "DAO_TAO", "TRAINING_READONLY"],
];

for (const [label, department, role] of candidates) {
  if (!/^U\d{3}$/.test(label) || !department || !role) throw new Error("invalid synthetic mapping");
  console.log(`PREFLIGHT ${label} department=${department} role=${role} state=INACTIVE steps=8`);
}

console.log("HEU_USER_005_SYNTHETIC_AUTH_OPERATOR_PREFLIGHT: PASS_LOCAL");
console.log("CANDIDATES_SIMULATED=5 AUTH_CREATED=0 EMAIL_SENT=0 DB_MUTATIONS=0");
console.log("NO_GO: synthetic preflight only; no real Auth provisioning or activation.");
