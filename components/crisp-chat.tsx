"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat = () => {
	useEffect(() => {
		Crisp.configure("1dd904e9-890f-43d7-8ded-92e88ca7f9e2");
	}, []);

	return null;
};
