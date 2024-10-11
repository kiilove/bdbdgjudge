import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useFirestoreUpdateData } from "../hooks/useFirestores";
import { useNavigate } from "react-router-dom";
import JudgeSignNew from "../modals/JudgeSignNew";

const JudgeInfoEdit = () => {
  const [form] = Form.useForm();
  const [judgeInfo, setJudgeInfo] = useState(null);
  const [signatureData, setSignatureData] = useState(null); // 서명 데이터 상태
  const { updateData } = useFirestoreUpdateData("judges_pool");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInJudge = sessionStorage.getItem("loggedInJudge");
    if (loggedInJudge) {
      const judgeData = JSON.parse(loggedInJudge);
      setJudgeInfo(judgeData);
      setSignatureData(judgeData.judgeSignature); // 기존 서명을 초기값으로 설정
      form.setFieldsValue(judgeData); // 기존 정보로 폼 초기화
    } else {
      window.location.href = "/login";
    }
  }, [form]);

  const handleSignatureComplete = (data) => {
    setSignatureData(data);
  };

  const handleSave = async (values) => {
    try {
      const updatedData = { ...values, judgeSignature: signatureData };
      await updateData(judgeInfo.judgesPoolId, updatedData);

      message.success("정보가 성공적으로 수정되었습니다.");

      // 업데이트된 정보를 세션에 저장
      sessionStorage.setItem("loggedInJudge", JSON.stringify(updatedData));

      navigate("/dashboard");
    } catch (error) {
      console.error("정보 수정 중 오류 발생:", error);
      message.error("정보 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          내 정보 수정
        </h2>
        {judgeInfo && (
          <Form form={form} onFinish={handleSave} layout="vertical">
            <Form.Item name="judgeUserId" label="아이디">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="judgeName"
              label="이름"
              rules={[{ required: true, message: "이름을 입력해주세요." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="judgePromoter"
              label="소속"
              rules={[{ required: true, message: "소속을 입력해주세요." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="judgeTel"
              label="전화번호"
              rules={[
                {
                  required: true,
                  pattern: /^\d{11}$/,
                  message: "휴대전화는 숫자만 11자리 입력해주세요.",
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* 서명 패드에 초기 서명 데이터를 로드 */}
            <div className="mb-4">
              <JudgeSignNew
                onSignatureComplete={handleSignatureComplete}
                initialSignature={signatureData}
              />
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="bg-blue-500 text-white"
              >
                저장
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default JudgeInfoEdit;
