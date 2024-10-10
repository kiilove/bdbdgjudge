import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { BsGoogle } from "react-icons/bs";
import { auth, googleProvider } from "../firebase"; // googleProvider 대신 getGoogleProvider 사용
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useFirestoreQuery } from "../hooks/useFirestores"; // Firestore에서 추가 확인용

const Login = () => {
  const navigate = useNavigate();
  const { getDocuments } = useFirestoreQuery();
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (values) => {
    const { judgeUserId, judgePassword } = values;
    setLoading(true);
    try {
      // Firestore에서 judgeUserId로 이메일을 확인
      const existingUser = await getDocuments("judges_pool", [
        { where: ["judgeUserId", "==", judgeUserId] },
      ]);

      if (existingUser.length === 0) {
        message.error("해당 아이디를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      // 이메일로 Firebase 인증 처리
      const email = existingUser[0].judgeEmail;
      await signInWithEmailAndPassword(auth, email, judgePassword);
      message.success("로그인에 성공했습니다!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      message.error("로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const googleProvider = googleProvider(); // Google Provider 객체를 동적으로 생성
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Firestore에서 사용자가 존재하는지 확인
      const existingUser = await getDocuments("judges_pool", [
        { where: ["judgeUid", "==", user.uid] },
      ]);

      if (existingUser.length === 0) {
        message.warning(
          "등록되지 않은 계정입니다. 회원가입을 먼저 진행해주세요."
        );
      } else {
        message.success("구글로 로그인 성공!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      message.error("구글 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>
        <Form onFinish={handleEmailLogin} layout="vertical">
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
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              로그인
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="default"
          icon={<BsGoogle />}
          onClick={handleGoogleLogin}
          block
          loading={loading}
        >
          구글로 로그인
        </Button>
        <div className="text-center mt-4">
          계정이 없으신가요?{" "}
          <a href="/register" className="text-blue-500">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
