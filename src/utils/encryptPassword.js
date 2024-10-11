const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const encryptPassword = async (password) => {
  const encoder = new TextEncoder();
  const saltedPassword = password + SECRET_KEY;
  const data = encoder.encode(saltedPassword);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// encrypter는 이제 암호화된 비밀번호만 반환
export const encrypter = async (password) => {
  return await encryptPassword(password);
};
