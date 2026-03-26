export function validateSignup(values) {
  const errors = {};
  const name = values.name?.trim() || "";
  const email = values.email?.trim() || "";
  const password = values.password || "";

  if (!name) errors.name = "Name is required.";
  if (name && name.length < 2) errors.name = "Name should be at least 2 characters.";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) errors.email = "Email is required.";
  if (email && !emailRegex.test(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  if (password && password.length < 6) {
    errors.password = "Password should be at least 6 characters.";
  }

  return errors;
}

export function validateSignin(values) {
  const errors = {};
  const email = values.email?.trim() || "";
  const password = values.password || "";

  if (!email) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";

  return errors;
}
