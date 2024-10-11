import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Input, Button } from "antd";
import { encrypter } from "../utils/encryptPassword";

const Dashboard = () => {
  const [judgeInfo, setJudgeInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInJudge = sessionStorage.getItem("loggedInJudge");
    if (loggedInJudge) {
      setJudgeInfo(JSON.parse(loggedInJudge));
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleEditClick = () => {
    setPassword((prev) => (prev = ""));
    setIsModalVisible(true);
  };

  const handlePasswordCheck = async () => {
    if (judgeInfo) {
      const encryptedPassword = await encrypter(password);
      console.log(judgeInfo.judgePassword);
      if (encryptedPassword === judgeInfo.judgePassword) {
        setIsModalVisible(false);
        navigate("/judgeInfoEdit");
      } else {
        setError("비밀번호가 일치하지 않습니다.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-300 to-sky-700 text-white">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center text-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h2>
        {judgeInfo && (
          <div>
            <p className="text-xl font-semibold mb-2">
              환영합니다,{" "}
              <span className="text-indigo-500">{judgeInfo.judgeName}</span>님!
            </p>
            <div className="text-left mt-4">
              <p className="mb-2">
                <span className="font-bold">소속:</span>{" "}
                {judgeInfo.judgePromoter}
              </p>
              <p className="mb-4">
                <span className="font-bold">전화번호:</span>{" "}
                {judgeInfo.judgeTel}
              </p>
              {judgeInfo.judgeSignature && (
                <div className="mt-4">
                  <p className="font-bold">서명:</p>
                  <img
                    src={judgeInfo.judgeSignature}
                    alt="Judge Signature"
                    className="w-full h-auto border mt-2"
                  />
                </div>
              )}
            </div>
            <Button
              className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-lg transition duration-300"
              onClick={handleEditClick}
            >
              내 정보 수정
            </Button>
          </div>
        )}

        <Modal
          title={<span className="text-lg font-bold">비밀번호 확인</span>}
          visible={isModalVisible}
          onOk={handlePasswordCheck}
          onCancel={() => setIsModalVisible(false)}
          okText="확인"
          cancelText="취소"
          okButtonProps={{
            className: "bg-blue-500 text-white hover:bg-blue-600",
          }}
        >
          <Input.Password
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handlePasswordCheck} // 엔터 키로 비밀번호 확인
            className="p-2 border rounded-md w-full"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
