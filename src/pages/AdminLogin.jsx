import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "antd";
import useFirebaseAuth from "../hooks/useFireAuth";

const AdminLogin = () => {
  const { logInWithEmail, authError, currentUser } = useFirebaseAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = "jbkim@jncore.com"; // 고정된 이메일

  useEffect(() => {
    if (currentUser) {
      navigate("/admin");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authError) {
      setError("비밀번호가 틀렸습니다. 다시 시도해주세요.");
    }
  }, [authError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // 오류 메시지 초기화
    await logInWithEmail(email, password); // 로그인 시도
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          관리자 로그인
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              비밀번호:
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              className="w-full"
            />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            block
            className="bg-blue-500 text-white"
          >
            로그인
          </Button>
        </form>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
