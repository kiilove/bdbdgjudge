import React, { useEffect, useState } from "react";
import {
  useFirestoreQuery,
  useFirestoreUpdateData,
  useFirestoreDeleteData,
} from "../hooks/useFirestores";
import { encrypter } from "../utils/encryptPassword";
import { Table, Button, Modal, Input, message, Form } from "antd";
import JudgeSignNew from "../modals/JudgeSignNew";
import useFirebaseAuth from "../hooks/useFireAuth";

const AdminDashboard = () => {
  const { getDocuments } = useFirestoreQuery();
  const { updateData } = useFirestoreUpdateData("judges_pool");
  const { deleteData } = useFirestoreDeleteData("judges_pool");
  const { logOut } = useFirebaseAuth();
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm] = Form.useForm();

  useEffect(() => {
    const fetchJudges = async () => {
      setLoading(true);
      const judgeList = await getDocuments("judges_pool");
      setJudges(judgeList);
      setFilteredJudges(judgeList);
      setLoading(false);
    };
    fetchJudges();
  }, []);

  const handleEncrypt = async (judge) => {
    if (judge.judgePassword) {
      const encryptedPassword = await encrypter(judge.judgePassword);
      await updateData(judge.id, {
        judgePassword: encryptedPassword,
        judgePasswordCheck: encryptedPassword,
      });

      setJudges((prevJudges) =>
        prevJudges.map((item) =>
          item.id === judge.id
            ? { ...item, judgePassword: encryptedPassword }
            : item
        )
      );

      message.success(`${judge.judgeUserId}의 비밀번호가 암호화되었습니다.`);
    } else {
      message.warning("비밀번호가 없습니다.");
    }
  };

  const handleChangePassword = (judge) => {
    setSelectedJudge(judge);
    setIsPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    if (newPassword) {
      const encryptedPassword = await encrypter(newPassword);
      await updateData(selectedJudge.id, {
        judgePassword: encryptedPassword,
        judgePasswordCheck: encryptedPassword,
      });

      setJudges((prevJudges) =>
        prevJudges.map((item) =>
          item.id === selectedJudge.id
            ? { ...item, judgePassword: encryptedPassword }
            : item
        )
      );

      setIsPasswordModalVisible(false);
      setNewPassword("");
      message.success("비밀번호가 성공적으로 변경되었습니다.");
    } else {
      message.error("새 비밀번호를 입력해주세요.");
    }
  };

  const handleDeleteJudge = (judge) => {
    setSelectedJudge(judge);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    await deleteData(selectedJudge.id);
    setJudges((prevJudges) =>
      prevJudges.filter((item) => item.id !== selectedJudge.id)
    );
    setFilteredJudges((prevFiltered) =>
      prevFiltered.filter((item) => item.id !== selectedJudge.id)
    );
    setIsDeleteModalVisible(false);
    message.success("심판이 성공적으로 삭제되었습니다.");
  };

  const handleEditJudge = (judge) => {
    setSelectedJudge(judge);
    editForm.setFieldsValue(judge);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    await updateData(selectedJudge.id, { ...values });

    setJudges((prevJudges) =>
      prevJudges.map((item) =>
        item.id === selectedJudge.id ? { ...item, ...values } : item
      )
    );

    setFilteredJudges((prevFiltered) =>
      prevFiltered.map((item) =>
        item.id === selectedJudge.id ? { ...item, ...values } : item
      )
    );

    setIsEditModalVisible(false);
    message.success("정보가 성공적으로 수정되었습니다.");
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = judges.filter(
      (judge) =>
        judge.judgeUserId.toLowerCase().includes(value) ||
        judge.judgeName.toLowerCase().includes(value)
    );
    setFilteredJudges(filtered);
  };

  const columns = [
    { title: "아이디", dataIndex: "judgeUserId", key: "judgeUserId" },
    { title: "이름", dataIndex: "judgeName", key: "judgeName" },
    {
      title: "비밀번호 상태",
      key: "passwordStatus",
      render: (text, judge) => (
        <span>
          {judge.judgePassword && judge.judgePassword.length === 64
            ? "암호화됨"
            : "암호화 안됨"}
        </span>
      ),
    },
    {
      title: "사인",
      key: "signature",
      render: (text, judge) =>
        judge.judgeSignature ? (
          <img
            src={judge.judgeSignature}
            alt="Judge Signature"
            className="w-20 h-10 object-contain border"
          />
        ) : (
          <span>없음</span>
        ),
    },
    {
      title: "작업",
      key: "actions",
      render: (text, judge) => (
        <div className="flex space-x-2">
          {!judge.judgePassword || judge.judgePassword.length !== 64 ? (
            <Button onClick={() => handleEncrypt(judge)}>암호화</Button>
          ) : null}
          <Button
            onClick={() => handleEditJudge(judge)}
            style={{ backgroundColor: "#1D4ED8", color: "#ffffff" }}
          >
            정보수정
          </Button>
          <Button onClick={() => handleChangePassword(judge)}>
            비밀번호 변경
          </Button>
          <Button danger onClick={() => handleDeleteJudge(judge)}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      message.success("로그아웃 되었습니다.");
      window.location.href = "/admin-login"; // 로그인 페이지로 이동
    } catch (error) {
      message.error("로그아웃 중 오류가 발생했습니다.");
    }
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold">관리자 대시보드</h1>
        <span className="text-xl font-medium">
          전체 심판 수: {judges.length}
        </span>
        <Button
          onClick={handleLogout}
          type="primary"
          className="bg-red-500 text-white"
        >
          로그아웃
        </Button>
      </div>
      <Input.Search
        placeholder="이름 또는 아이디로 검색"
        onChange={handleSearch}
        value={searchTerm}
        className="mb-4"
      />
      <Table
        columns={columns}
        dataSource={filteredJudges}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="bg-white shadow-md rounded-lg"
      />

      {/* 비밀번호 변경 모달 */}
      <Modal
        title="비밀번호 변경"
        visible={isPasswordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => setIsPasswordModalVisible(false)}
        okText="변경"
        cancelText="취소"
        okButtonProps={{
          style: { backgroundColor: "#1D4ED8", color: "#ffffff" },
        }}
      >
        <Input.Password
          placeholder="새 비밀번호 입력"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title="삭제 확인"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <p>{selectedJudge?.judgeName} 심판을 정말 삭제하시겠습니까?</p>
      </Modal>

      {/* 정보 수정 모달 */}
      <Modal
        title="정보 수정"
        visible={isEditModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalVisible(false)}
        okText="수정"
        cancelText="취소"
        okButtonProps={{
          style: { backgroundColor: "#1D4ED8", color: "#ffffff" },
        }}
      >
        <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
          <Form.Item
            name="judgeUserId"
            label="아이디"
            rules={[{ required: true, message: "아이디을 입력해주세요." }]}
          >
            <Input />
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
          <Form.Item label="사인">
            <JudgeSignNew
              initialSignature={selectedJudge?.judgeSignature}
              onSignatureComplete={(data) =>
                editForm.setFieldsValue({ judgeSignature: data })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
