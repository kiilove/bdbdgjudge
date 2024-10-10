// components/JudgeSignNew.js
import React, { useEffect, useState } from "react";
import useSignature from "../hooks/useSignature";
import SignaturePad from "react-signature-pad-wrapper";
import { AiOutlineUnlock, AiOutlineLock } from "react-icons/ai"; // 잠금/해제 아이콘 추가
import { Button } from "antd";

const JudgeSignNew = ({ onSignatureComplete }) => {
  const { signCanvasRef, saveSignature, clearSignature } = useSignature();
  const [isLocked, setIsLocked] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      if (signCanvasRef.current && signCanvasRef.current._canvas) {
        const canvas = signCanvasRef.current._canvas;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
      }
    };

    // 컴포넌트가 마운트될 때 캔버스 리사이즈
    resizeCanvas();

    // 창 크기 변경 시 캔버스 리사이즈
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [signCanvasRef]);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLock = () => {
    if (!signCanvasRef.current || signCanvasRef.current.isEmpty()) {
      alert("서명을 입력해주세요.");
      return;
    }
    const signatureData = saveSignature(); // 서명 데이터 저장
    setIsLocked(true);
    setHasSignature(true);
    if (onSignatureComplete) {
      onSignatureComplete(signatureData);
    }
  };

  const handleCancel = () => {
    clearSignature();
    setIsLocked(true);
    setHasSignature(false);
    if (onSignatureComplete) {
      onSignatureComplete(null);
    }
  };

  const handleEdit = () => {
    setIsLocked(false);
  };

  return (
    <div className="flex flex-col items-center gap-y-4">
      {/* 서명 패드 영역 */}
      <div className="relative w-full h-64 border-4 border-dashed bg-yellow-50">
        <SignaturePad
          ref={signCanvasRef}
          options={{
            minWidth: 3,
            maxWidth: 5,
            penColor: "black",
          }}
          canvasProps={{
            id: "signatureCanvas",
            style: {
              width: "100%",
              height: "100%",
              border: "1px solid #027C8C",
            },
          }}
        />
        {/* 잠금 상태일 때 열쇠 아이콘 오버레이 */}
        {isLocked && (
          <div
            className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-25 cursor-pointer"
            onClick={handleUnlock}
          >
            <AiOutlineUnlock size={50} color="#fff" />
          </div>
        )}
        {/* 서명이 완료된 후 잠금 아이콘 오버레이 */}
        {hasSignature && isLocked && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-25 pointer-events-none">
            <AiOutlineLock size={50} color="#fff" />
          </div>
        )}
      </div>

      {/* 서명 패드가 잠금 해제된 상태일 때 버튼들 */}
      {!isLocked && (
        <div className="flex w-full gap-x-2 px-1">
          <Button
            onClick={handleLock}
            className="w-1/2 bg-green-500 text-white hover:bg-green-600"
          >
            완료
          </Button>
          <Button
            onClick={handleCancel}
            className="w-1/2 bg-gray-300 text-black hover:bg-gray-400"
          >
            취소
          </Button>
        </div>
      )}

      {/* 서명이 완료된 후 수정할 수 있는 버튼 */}
      {hasSignature && isLocked && (
        <div className="flex w-full gap-x-2 px-1">
          <Button
            onClick={handleEdit}
            className="w-full bg-yellow-500 text-white hover:bg-yellow-600"
          >
            서명 수정
          </Button>
        </div>
      )}
    </div>
  );
};

export default JudgeSignNew;
