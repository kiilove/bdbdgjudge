import { Modal } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { BsInfoLg, BsPersonPlusFill } from "react-icons/bs";
import JudgeSignNew from "../modals/JudgeSignNew";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import useSignature from "../hooks/useSignature";
import CanvasWithImageData from "../components/CanvasWithImageData";
import { useFirestoreAddData, useFirestoreQuery } from "../hooks/useFirestores";
import ConfirmationModal from "../messageBox/ConfirmationModal";
import { where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
const initJudgeValidate = {
  judgeName: undefined,
  judgePassword: undefined,
  judgePasswordCheck: true,
  judgePromoter: undefined,
  judgeTel: undefined,
  judgeUserId: undefined,
  judgeUserIdCheck: false,
};

const initJudgeInfo = {
  judgeName: "",
  judgePassword: "",
  judgePasswordCheck: "",
  judgePromoter: "",
  judgeTel: "",
  judgeUserId: "",
  judgeUserIdCheck: false,
  judgeSignature: "",
  isConfirmed: true,
  isActived: true,
  isJoined: false,
};
const Register = () => {
  const [judgeInfo, setJudgeInfo] = useState({ ...initJudgeInfo });
  const [isOpen, setIsOpen] = useState({
    sign: false,
  });
  const [idUnique, setIdUnique] = useState(undefined);
  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});
  const [validate, setValidate] = useState({
    ...initJudgeValidate,
  });
  const idValueRef = useRef();
  const navigate = useNavigate();

  const addJudge = useFirestoreAddData("judges_pool");
  const fetchQuery = useFirestoreQuery();

  const { readSignature, signCanvasRef } = useSignature();

  const checkIdUnique = async (value) => {
    const condition = [where("judgeUserId", "==", value)];

    if (value.length <= 5) {
      return;
    }
    try {
      await fetchQuery.getDocuments("judges_pool", condition).then((data) => {
        console.log(data);
        if (data.length === 0) {
          setIdUnique(true);
          setJudgeInfo({ ...judgeInfo, judgeUserIdCheck: true });
        } else {
          setIdUnique(false);
          setJudgeInfo({ ...judgeInfo, judgeUserIdCheck: false });
        }
      });
      console.log(idUnique);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignClose = () => {
    setIsOpen(() => ({
      sign: false,
      title: "",
      info: {},
    }));
  };

  const msgClose = () => {
    setMsgOpen(false);
  };

  const msgConfirm = () => {
    setJudgeInfo({ ...initJudgeInfo });
    setValidate({ ...initJudgeValidate });
    setMsgOpen(false);
  };

  const checkValidInputs = (obj) => {
    for (let key in obj) {
      if (key !== "isJoined") {
        if (typeof obj[key] === "string" && obj[key].trim() === "") {
          return false; // 빈 문자열을 가진 속성이 있음
        } else if (typeof obj[key] === "boolean" && obj[key] === false) {
          return false; // false 값을 가진 속성이 있음
        }
      }
    }
    return true; // 모든 속성이 유효함
  };
  const handleSave = async () => {
    if (!checkValidInputs(judgeInfo)) {
      setMessage({
        body: "꼭 필요한 항목입니다. ",
        body2: "전부 입력해주세요",
        isButton: true,
        confirmButtonText: "확인",
      });
      setMsgOpen(true);
      return;
    }
    const judgeUid = uuidv4();
    const createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    try {
      await addJudge
        .addData({ ...judgeInfo, judgeUid, createdAt })
        .then(() =>
          setMessage({
            body: "정상적으로 접수되었습니다.",
            body2: "협회승인후 로그인할 수 있습니다.",
            isButton: true,
            confirmButtonText: "확인",
          })
        )
        .then(() => setMsgOpen(true))
        .then(() => navigate("/"));
    } catch (error) {
      console.log(error);
    }
  };
  const handleInputs = (e) => {
    const { name, value } = e.target;
    if (name !== "judgeTel") {
      setJudgeInfo(() => ({ ...judgeInfo, [name]: value.trim().toString() }));
      handleValidate(name, value);
    }
    if (name === "judgeTel") {
      const newValue = value.replaceAll("-", "");
      setJudgeInfo(() => ({
        ...judgeInfo,
        [name]: newValue.trim().toString(),
      }));
      handleValidate(name, value);
    }

    if (name === "judgeUserId") {
      setJudgeInfo({
        ...judgeInfo,
        judgeUserId: value.trim().toString(),
        judgeUserIdCheck: false,
      });
      setIdUnique(false);
    }
  };

  const handleValidate = (name, value) => {
    switch (name) {
      case "judgeName":
        if (value.length) {
          setValidate(() => ({ ...validate, [name]: false }));
        }
        break;
      case "judgePromoter":
        if (value.length) {
          setValidate(() => ({ ...validate, [name]: false }));
        }
        break;
      case "judgeTel":
        if (value.length === 11) {
          setValidate(() => ({ ...validate, [name]: false }));
        } else {
          setValidate(() => ({ ...validate, [name]: true }));
        }
        break;

      case "judgePassword":
        if (value.length < 6) {
          setValidate(() => ({
            ...validate,
            [name]: true,
            judgePasswordCheck:
              value === judgeInfo.judgePasswordCheck ? false : true,
          }));
        } else {
          setValidate(() => ({
            ...validate,
            [name]: false,
            judgePasswordCheck:
              value === judgeInfo.judgePasswordCheck ? false : true,
          }));
        }
        break;

      case "judgePasswordCheck":
        if (judgeInfo.judgePassword.toString() !== value.toString()) {
          setValidate(() => ({ ...validate, [name]: true }));
        } else {
          setValidate(() => ({ ...validate, [name]: false }));
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    console.log(idUnique);
  }, [idUnique]);

  useEffect(() => {
    console.log(judgeInfo);
  }, [judgeInfo]);

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-blue-300 to-sky-700 p-2 flex justify-center">
      <Modal open={isOpen.sign} onClose={handleSignClose}>
        <div
          className="flex w-full lg:w-1/3 h-screen lg:h-auto absolute top-1/2 left-1/2 lg:shadow-md lg:rounded-lg bg-white p-3"
          style={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <JudgeSignNew setClose={handleSignClose} propState={isOpen} />
        </div>
      </Modal>
      <ConfirmationModal
        isOpen={msgOpen}
        onConfirm={msgConfirm}
        onCancel={msgClose}
        message={message}
      />
      <div
        className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2 justify-start items-start"
        style={{ maxWidth: "800px" }}
      >
        <div className="flex w-full h-14">
          <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
            <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
              <BsPersonPlusFill />
            </span>
            <h1
              className="font-sans text-lg font-semibold"
              style={{ letterSpacing: "2px" }}
            >
              심판등록 정보입력
            </h1>
          </div>
        </div>
        <div className="flex w-full h-full items-start">
          <div className="flex w-full h-full justify-start items-start">
            <div className="flex w-full h-full justify-start items-start px-3 lg:pt-0 gap-y-1 lg:gap-y-3 flex-col ">
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">이름</h3>
                </div>
                <div
                  className={`${
                    validate.judgeName !== false
                      ? "flex w-full h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                      : "flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                  }`}
                >
                  <input
                    type="text"
                    name="judgeName"
                    id="judgeName"
                    className="h-10 w-full outline-none mb-1"
                    placeholder="실명"
                    value={judgeInfo.judgeName}
                    onChange={(e) => handleInputs(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">소속</h3>
                </div>
                <div
                  className={`${
                    validate.judgePromoter !== false
                      ? "flex w-full h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                      : "flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                  }`}
                >
                  <input
                    type="text"
                    name="judgePromoter"
                    id="judgePromoter"
                    className="h-10 w-full outline-none mb-1"
                    placeholder="심판자격증에 기재된 소속(예:경기도)"
                    value={judgeInfo.judgePromoter}
                    onChange={(e) => handleInputs(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">휴대전화</h3>
                </div>
                <div
                  className={`${
                    validate.judgeTel !== false
                      ? "flex w-full h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                      : "flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                  }`}
                >
                  <input
                    type="text"
                    name="judgeTel"
                    id="judgeTel"
                    className="h-10 w-full outline-none mb-1"
                    placeholder="010 포함 숫자만 입력"
                    value={judgeInfo.judgeTel}
                    onChange={(e) => handleInputs(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">사용자아이디</h3>
                </div>
                <div className="flex w-full lg:w-3/4">
                  <div
                    className={`${
                      !judgeInfo.judgeUserIdCheck
                        ? "flex w-3/4 h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 "
                        : "flex w-3/4 h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0  "
                    }`}
                  >
                    <input
                      type="text"
                      name="judgeUserId"
                      id="judgeUserId"
                      className="h-10 w-full outline-none mb-1"
                      placeholder="6자리 이상 영문과 숫자로 구성해주세요."
                      value={judgeInfo.judgeUserId}
                      autoCorrect="off"
                      ref={idValueRef}
                      onChange={(e) => handleInputs(e)}
                    />
                  </div>
                  <div className="flex w-1/4 h-12 ml-2">
                    {idUnique ? (
                      <button
                        className="flex w-full h-12 justify-center items-center border-green-800 bg-green-500 border border-b-2 border-r-2 rounded-lg"
                        onClick={() =>
                          checkIdUnique(idValueRef?.current?.value)
                        }
                      >
                        사용가능
                      </button>
                    ) : (
                      <button
                        className="flex w-full h-12 justify-center items-center border-green-600 border border-b-2 border-r-2 rounded-lg"
                        onClick={() =>
                          checkIdUnique(idValueRef?.current?.value)
                        }
                      >
                        중복체크
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {!idUnique && !validate.judgeUserIdCheck && (
                <div className="flex w-full h-auto ml-2">
                  <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center mr-0 lg:mr-5 text-sm"></div>
                  <span className="text-sm">
                    아이디 유효성 검사가 필요합니다.
                  </span>
                </div>
              )}
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">비밀번호</h3>
                </div>
                <div
                  className={`${
                    validate.judgePassword !== false
                      ? "flex w-full h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                      : "flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                  }`}
                >
                  <input
                    type="password"
                    name="judgePassword"
                    id="judgePassword"
                    className="h-10 w-full outline-none mb-1"
                    placeholder="보안을위해 6자리 이상 입력해주세요."
                    value={judgeInfo.judgePassword}
                    onChange={(e) => handleInputs(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">비밀번호확인</h3>
                </div>
                <div
                  className={`${
                    validate.judgePasswordCheck !== false
                      ? "flex w-full h-12 justify-start items-center border-red-600 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                      : "flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 lg:w-3/4 "
                  }`}
                >
                  <input
                    type="password"
                    name="judgePasswordCheck"
                    id="judgePasswordCheck"
                    className="h-10 w-full outline-none mb-1"
                    value={judgeInfo.judgePasswordCheck}
                    onChange={(e) => handleInputs(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex px-3 w-full lg:w-1/4 justify-start lg:justify-end items-center h-12 mr-0 lg:mr-5">
                  <h3 className="font-sans font-semibold">서명</h3>
                </div>
                <div className="flex w-full h-auto justify-start items-center mb-3 lg:mb-0 lg:w-3/4 flex-col">
                  {judgeInfo.judgeSignature && (
                    <div className="w-full h-full ">
                      <CanvasWithImageData
                        imageData={judgeInfo.judgeSignature}
                      />
                    </div>
                  )}
                  <button
                    className="flex w-full h-12 justify-center items-center border-red-600 border border-b-2 border-r-2 rounded-lg  "
                    onClick={() =>
                      setIsOpen({
                        ...isOpen,
                        sign: true,
                        state: judgeInfo,
                        setState: setJudgeInfo,
                      })
                    }
                  >
                    서명등록하기
                  </button>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row w-full">
                <div className="flex w-full h-16 justify-start items-center mb-3 lg:mb-0 ">
                  <button
                    className="flex w-full h-16 justify-center items-center bg-gradient-to-r from-blue-200 to-cyan-200  "
                    onClick={() => handleSave()}
                  >
                    등록신청
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
