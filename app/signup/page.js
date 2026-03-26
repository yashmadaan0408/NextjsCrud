"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth";
import { validateSignup } from "@/lib/validation";

const initialValues = {
  name: "",
  email: "",
  password: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function onChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    const validationErrors = validateSignup(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await signupUser(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign Up</h1>
        <p>Create your account using name, email and password.</p>

        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={values.name} onChange={onChange} />
        {errors.name && <span className="error">{errors.name}</span>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={onChange} />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <div className="password-input-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={onChange}
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password}</span>}

        {serverError && <div className="error-box">{serverError}</div>}

        <button type="submit">Create Account</button>
        <p className="subtext">
          Already have an account? <Link href="/signin">Sign In</Link>
        </p>
      </form>
    </main>
  );
}
