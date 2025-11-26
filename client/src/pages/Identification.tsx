import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Identification() {
	const navigate = useNavigate();
	const { setNuqsUsername } = useAuth();
	const [inputValue, setInputValue] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = () => {
		navigate("/");
		setNuqsUsername(inputValue);
	};

	return (
		<div>
			<h1>Identification Page</h1>

			<input
				type="text"
				placeholder="Enter your name"
				onChange={handleChange}
			/>

			<button type="button" onClick={handleSubmit}>
				Validate username
			</button>
		</div>
	);
}
