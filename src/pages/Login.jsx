import React, { useState, useEffect } from "react";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useFirestoreQuery } from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { encrypter } from "../utils/encryptPassword";

const Login = () => {
  const navigate = useNavigate();
  const { getDocuments } = useFirestoreQuery();
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(""); // 오류 메시지 상태

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogin = async (values) => {
    const { judgeUserId, judgePassword } = values;
    setLoading(true);
    setShake(false);
    setError("");

    try {
      const existingUser = await getDocuments("judges_pool", [
        where("judgeUserId", "==", judgeUserId),
      ]);

      if (existingUser.length === 0) {
        setShake(true);
        setError("등록된 아이디가 없습니다.");
        return;
      }

      const encryptedPassword = await encrypter(judgePassword);

      const user = existingUser[0];
      if (user.judgePassword !== encryptedPassword) {
        setShake(true);
        setError("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      sessionStorage.setItem(
        "loggedInJudge",
        JSON.stringify({
          judgeName: user.judgeName,
          judgeUserId: user.judgeUserId,
          judgePromoter: user.judgePromoter,
          judgeSignature: user.judgeSignature,
          judgeTel: user.judgeTel,
          judgePassword: user.judgePassword,
          judgesPoolId: user.id,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 중 오류:", error);
      setError("로그인 실패: 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700">
      <div
        className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-lg transition-transform ${
          shake ? "transform -translate-x-4" : ""
        }`}
        style={{ animation: shake ? "shake 0.5s" : "none" }}
        onAnimationEnd={() => setShake(false)}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">심판 로그인</h2>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="judgeUserId"
            label="아이디"
            rules={[{ required: true, message: "아이디를 입력해주세요." }]}
          >
            <Input placeholder="아이디" />
          </Form.Item>
          <Form.Item
            name="judgePassword"
            label="비밀번호"
            rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}

          <Form.Item>
            <Button
              htmlType="submit"
              block
              loading={loading}
              className="bg-blue-500 text-white py-5 text-lg hover:bg-blue-600"
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        {/* 심판 등록 신청 버튼 */}
        <Button
          onClick={() => navigate("/register")}
          block
          className="bg-gray-800 text-white py-5 mt-2 text-lg hover:bg-gray-600"
        >
          심판 등록 신청
        </Button>
      </div>
    </div>
  );
};

export default Login;
