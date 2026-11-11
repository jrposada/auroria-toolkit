function getEnvVariable(key: string): string {
  const value = import.meta.env[`VITE_${key}`];

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

export { getEnvVariable };
