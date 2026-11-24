"use strict";

// The trusted range and retention period are simulated audit requirements.
function checkFirewall(config) {
  return config.firewall.unrestrictedAdminAccess &&
    config.firewall.adminSource === "192.0.2.0/24";
}

function checkLogging(config) {
  return config.logging.enabled && config.logging.retentionDays >= 90 &&
    config.logging.protectedFromChanges;
}

function checkEncryption(config) {
  return config.storage.encrypted && config.storage.encryptedInTransit;
}

function checkMFA(config){
  try{
    if(config.mfa.username === "rizz" && config.mfa.password === "1234567"){
      if(config.mfa.verify && config.mfa.code === 12){
        return true;
      }else{
        throw  Error("Error: Need to Verify, and try again!!!");
      }
      }else{
        throw Error("Error: The username and password is incorrect!!!");
    }
  }catch(err){
    console.error(err.message)
    throw error;
  }
}
function checkDisclosure(config) {
  return config.disclosure.policy && config.disclosure.present;
}

const controls = [
  {
    id: "credentials",
    name: "Administrator credentials",
    detail: "Unique credentials and changed default password",
    check: (c) =>
      c.adminCredentials.unique && c.adminCredentials.defaultPasswordChanged,
  },
  {
    id: "firewall",
    name: "Firewall rules",
    detail: "Administrator access is restricted to the trusted range 192.0.2.0/24",
    check: checkFirewall,
  },
  {
    id: "logging",
    name: "System logging",
    detail: "Logs are enabled, protected, and retained for at least 90 days",
    check: checkLogging,
  },
  {
    id: "encryption",
    name: "Data encryption",
    detail: "Data is encrypted at rest and in transit",
    check: checkEncryption,
  },
  {
    id: "mfa",
    name: "Multi-factor authentication",
    detail: "MFA is enforced for administrators",
    check: checkMFA,
  },
  {
    id: "disclosure",
    name: "Disclosure policy",
    detail: "A security disclosure policy is present",
    check: checkDisclosure,
  },
];

function runAudit() {
  const results = controls.map((control) => {
    if (typeof control.check !== "function")
      return { ...control, status: "pending" };
    const result = control.check(cloudConfig);
    // A missing value must not silently become a pass.
    return { ...control, status: result === true ? "pass" : "fail" };
  });
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const pending = results.filter((r) => r.status === "pending").length;
  const checked = passed + failed;
  const score = checked ? Math.round((passed / checked) * 100) : null;
  const audit = {
    results,
    passed,
    failed,
    pending,
    checked,
    score,
    time: new Date(),
  };
  console.log("Audit results:", audit);
  return audit;
}

