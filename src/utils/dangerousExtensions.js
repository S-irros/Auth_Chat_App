export const dangerousExtensions = [
  // Executable and system files
  "exe", "bat", "cmd", "com", "msi", "apk", "sh", "bash", "bin", "jar", "ps1", "wsf", "vbs",
  "scr", "reg", "dll", "pl", "py", "cgi", "rb", "app", "asp", "aspx", "php", "php3", "php4",
  "php5", "phps", "phtml", "jsp", "cfm", "cshtml", "vbe", "jscript", "msi", "dat", "phtm",

  // Web-related dangerous files
  "html", "htm", "xhtml", "xsl", "xml", "tpl", "cfm", "erb", "asp", "aspx", "php5", "php3",
  "php4", "phps", "phtml", "jsp", "cfm", "pl", "cgi", "shtml", "cfc", "htaccess", "htpasswd",
  "inc", "svn", "git", "sh", "bash", "yaml", "yml", "ejs", "vue", "jsx",

  // Malicious file types and scripting languages
  "jar", "vbs", "php", "sh", "jsp", "htaccess", "asp", "cgi", "vbe", "bat", "cmd", "exe",
  "apk", "sh", "bash", "msi", "app", "sys", "debug", "msp", "dmg", "pkg", "b64", "obj",

  // System-level and encrypted files
  "sys", "msi", "exe", "vbs", "dll", "drv", "bin", "dat", "reg", "config", "log", "bak",
  "swp", "temp", "cpl", "swt", "dmp", "mnt", "dbg", "cer", "crl", "pem", "csr", "key",
  "pfx", "p12", "crt", "csm", "pdb", "avx", "vmx", "vhd", "ova", "ovf", "htaccess",
  "osx", "dylib", "axd", "pid", "pogo", "scpt", "nsh", "nfs", "clj", "lua", "fish",
  "keygen", "shs"
];
