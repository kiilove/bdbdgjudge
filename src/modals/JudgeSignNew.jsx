import React, { useEffect, useState } from "react";
import useSignature from "../hooks/useSignature";
import SignaturePad from "react-signature-pad-wrapper";
import { AiOutlineUnlock, AiOutlineLock } from "react-icons/ai";
import { Button } from "antd";

const JudgeSignNew = ({ onSignatureComplete, initialSignature }) => {
  const { signCanvasRef, saveSignature, clearSignature } = useSignature();
  const [isLocked, setIsLocked] = useState(true);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

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

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 초기 서명 로드
    if (initialSignature && signCanvasRef.current) {
      signCanvasRef.current.fromDataURL(initialSignature);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [signCanvasRef, initialSignature]);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLock = () => {
    if (!signCanvasRef.current || signCanvasRef.current.isEmpty()) {
      alert("서명을 입력해주세요.");
      return;
    }
    const signatureData = saveSignature();
    setIsLocked(true);
    setHasSignature(true);
    if (onSignatureComplete) {
      onSignatureComplete(signatureData);
    }
  };

  const handleCancel = () => {
    clearSignature();
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
      <div className="relative w-full h-64 border-4 border-dashed bg-yellow-50">
        <SignaturePad
          ref={signCanvasRef}
          options={{
            minWidth: 0.5,
            maxWidth: 5,
            penColor: "black",
            throttle: 0,
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
        {isLocked && (
          <div
            className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-25 cursor-pointer"
            onClick={handleUnlock}
          >
            <AiOutlineUnlock size={50} color="#fff" />
          </div>
        )}
        {hasSignature && isLocked && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-25 pointer-events-none">
            <AiOutlineLock size={50} color="#fff" />
          </div>
        )}
      </div>

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
            지우기
          </Button>
        </div>
      )}

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
