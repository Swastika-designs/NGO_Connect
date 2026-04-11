import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });

	const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		// Placeholder auth until backend login endpoint is wired.
		navigate("/ngo/verify/identity");
	};

	return (
		<div style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem" }}>
			<h1 style={{ marginBottom: 8 }}>Login to NGO Connect</h1>
			<p style={{ color: "#6b7280", marginBottom: 24 }}>
				Access your NGO dashboard and continue verification.
			</p>

			<form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
				<label style={{ display: "grid", gap: 6 }}>
					<span>Email</span>
					<input
						type="email"
						value={form.email}
						onChange={(e) => onChange("email", e.target.value)}
						required
						style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
					/>
				</label>

				<label style={{ display: "grid", gap: 6 }}>
					<span>Password</span>
					<input
						type="password"
						value={form.password}
						onChange={(e) => onChange("password", e.target.value)}
						required
						style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
					/>
				</label>

				<button
					type="submit"
					style={{
						marginTop: 8,
						padding: "12px 14px",
						borderRadius: 8,
						border: "none",
						background: "#111827",
						color: "#fff",
						fontWeight: 600,
						cursor: "pointer",
					}}
				>
					Login
				</button>

				<button
					type="button"
					onClick={() => navigate("/ngo/register")}
					style={{
						padding: "12px 14px",
						borderRadius: 8,
						border: "1px solid #d1d5db",
						background: "#fff",
						cursor: "pointer",
					}}
				>
					New NGO? Register
				</button>
			</form>
		</div>
	);
}
