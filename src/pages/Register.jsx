import React, { useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import { BsPersonPlusFill } from "react-icons/bs";
import { useFirestoreAddData, useFirestoreQuery } from "../hooks/useFirestores";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import JudgeSignNew from "../modals/JudgeSignNew";
import { where } from "firebase/firestore";
import { encrypter } from "../utils/encryptPassword"; // 암호화 함수 임포트

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { addData } = useFirestoreAddData("judges_pool");
  const { getDocuments } = useFirestoreQuery();
  const [idUnique, setIdUnique] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const checkIdUnique = async () => {
    const judgeUserId = form.getFieldValue("judgeUserId");
    if (!judgeUserId || judgeUserId.length < 6) {
      message.warning("아이디를 6자리 이상 입력해주세요.");
      return;
    }

    setIsChecking(true);
    try {
      const condition = [where("judgeUserId", "==", judgeUserId)];
      const data = await getDocuments("judges_pool", condition);
      if (data.length === 0) {
        setIdUnique(true);
        message.success("사용 가능한 아이디입니다.");
      } else {
        setIdUnique(false);
        message.error("이미 사용 중인 아이디입니다.");
      }
    } catch (error) {
      console.error("아이디 중복 확인 중 오류 발생:", error);
      message.error("아이디 중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async (values) => {
    const judgeUid = uuidv4();
    const createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");

    if (!signatureData) {
      message.warning("서명을 추가해주세요.");
      return;
    }

    if (idUnique === false || idUnique === null) {
      message.warning("아이디 중복 확인이 필요합니다.");
      return;
    }

    // 비밀번호 암호화
    const encryptedPassword = await encrypter(values.judgePassword);

    const registerData = {
      ...values,
      judgeUid,
      judgePassword: encryptedPassword, // 암호화된 비밀번호 저장
      judgePasswordCheck: encryptedPassword,
      judgeSignature: signatureData,
      createdAt,
      isConfirmed: true,
      isActived: true,
      isJoined: false,
    };

    // Firestore에 데이터를 저장하지 않고 콘솔에 출력
    console.log("등록 신청 데이터:", registerData);

    // 모달 데이터 설정 및 모달 표시
    setModalData(registerData);
    setIsModalVisible(true);

    message.success("등록 신청 데이터가 콘솔에 출력되었습니다.");
    // 추후 Firestore에 저장하려면 아래 주석을 해제하세요.
    /*
    try {
      await addData(registerData);
      message.success("정상적으로 등록되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
      message.error("등록 중 오류가 발생했습니다.");
    }
    */
  };

  const handleSignatureComplete = (data) => {
    setSignatureData(data);
  };

  const handleModalOk = async () => {
    setIsSubmitting(true); // 제출 중 상태를 true로 설정
    try {
      await addData(modalData);
      message.success("정상적으로 등록되었습니다.");
      setIsModalVisible(false); // 모달을 닫은 후
      navigate("/login"); // 로그인 페이지로 이동
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
      message.error("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false); // 제출 중 상태를 false로 설정하여 버튼 활성화
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    // 필요에 따라 추가 작업 수행 가능
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex items-center mb-6">
          <BsPersonPlusFill className="text-blue-500 text-2xl mr-3" />
          <h2 className="text-2xl font-semibold">심판등록 정보입력</h2>
        </div>
        <Form form={form} onFinish={handleRegister} layout="vertical">
          <Form.Item
            name="judgeName"
            label="이름"
            rules={[{ required: true, message: "이름을 입력해주세요." }]}
          >
            <Input placeholder="이름" />
          </Form.Item>
          <Form.Item
            name="judgePromoter"
            label="소속"
            rules={[{ required: true, message: "소속을 입력해주세요." }]}
          >
            <Input placeholder="소속" />
          </Form.Item>
          <Form.Item
            name="judgeTel"
            label="휴대전화"
            rules={[
              {
                required: true,
                pattern: /^\d{11}$/,
                message: "휴대전화는 숫자만 11자리 입력해주세요.",
              },
            ]}
          >
            <Input placeholder="01012345678" />
          </Form.Item>
          <Form.Item
            name="judgeUserId"
            label="사용자아이디"
            rules={[
              { required: true, min: 6, message: "6자리 이상 입력해주세요." },
            ]}
          >
            <div className="flex space-x-2">
              <Input placeholder="아이디" />
              <Button
                onClick={checkIdUnique}
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={isChecking}
              >
                {isChecking ? "확인 중..." : "아이디 중복확인"}
              </Button>
            </div>
          </Form.Item>
          {idUnique === true && (
            <span className="text-green-500">사용 가능한 아이디입니다.</span>
          )}
          {idUnique === false && (
            <span className="text-red-500">이미 사용 중인 아이디입니다.</span>
          )}
          <Form.Item
            name="judgePassword"
            label="비밀번호"
            rules={[
              { required: true, min: 6, message: "6자리 이상 입력해주세요." },
            ]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>
          <Form.Item
            name="judgePasswordCheck"
            label="비밀번호 확인"
            dependencies={["judgePassword"]}
            rules={[
              { required: true, message: "비밀번호를 확인해주세요." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("judgePassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("비밀번호가 일치하지 않습니다.")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 확인" />
          </Form.Item>

          {/* 서명 패드 삽입 */}
          <div className="mb-4">
            <JudgeSignNew onSignatureComplete={handleSignatureComplete} />
          </div>

          <Form.Item>
            <Button
              htmlType="submit"
              block
              className={`bg-blue-500 text-white hover:bg-blue-600 ${
                idUnique === false || idUnique === null
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={idUnique === false || idUnique === null}
            >
              등록신청
            </Button>
          </Form.Item>
        </Form>

        {/* 등록 신청 확인 모달 */}
        <Modal
          title="등록 신청 확인"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="등록"
          okButtonProps={{
            style: {
              backgroundColor: "#1D4ED8", // 파랑색 배경
              borderColor: "#1D4ED8", // 파랑색 테두리
              color: "#ffffff", // 흰색 텍스트
            },
          }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          {modalData && (
            <div>
              <p>
                <strong>이름:</strong> {modalData.judgeName}
              </p>
              <p>
                <strong>소속:</strong> {modalData.judgePromoter}
              </p>
              <p>
                <strong>휴대전화:</strong> {modalData.judgeTel}
              </p>
              <p>
                <strong>사용자아이디:</strong> {modalData.judgeUserId}
              </p>
              <p>
                <strong>서명:</strong>
              </p>
              <img
                src={modalData.judgeSignature}
                alt="Judge Signature"
                className="w-full h-auto border"
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Register;
