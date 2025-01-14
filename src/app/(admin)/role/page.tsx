"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Spin,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BaseModal from "@/src/component/config/BaseModal";
import { addRole, deleteRole, getRole } from "@/src/services/role";
import { getGroupSystem } from "@/src/services/groupSystem";
import { getBranchSystem } from "@/src/services/branchSystem";
import { getGroupTeam } from "@/src/services/groupTeam";
import { toast } from "react-toastify";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";
import LoadingTable from "@/src/component/LoadingTable";

export interface DataRole {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
  isAdmin?: boolean;
  groupSystemId?: number;
  groupSystemName?: string;
  groupBranchName?: string;
  groupBranchId?: number;
  groupTeamId?: number;
}

interface FilterRole {
  Name: string;
  Value: string;
}

const Role = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [dataRolePage, setDataRolePage] = useState<DataRole[]>([]);
  const [currentRole, setCurrentRole] = useState<DataRole | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [globalTerm, setGlobalTerm] = useState("");
  const [groupSystem, setGroupSystem] = useState([]);
  const [branchSystem, setBranchSystem] = useState([]);
  const [groupTeam, setGroupTeam] = useState([]);
  const [systemId, setSystemId] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [parentId, setParentId] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecord, setTotalRecord] = useState(100);
  const pageSize = 20;
  const [role, setRole] = useState(false);
  const [isAddRole, setIsAddRole] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFetchingRef = useRef(false);

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (pageIndex > 1 && dataRolePage.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchListRole(globalTerm).finally(() => {
        setTimeout(() => {

          window.scrollTo(0, scrollPositionBeforeFetch + scrollPositionBeforeFetch / 10);
          isFetchingRef.current = false;
        }, 0);
      });
    }
  }, [pageIndex]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchListRole = async (globalTerm?: string) => {
    const arrRole: FilterRole[] = [];
    const addedParams = new Set<string>();
    arrRole.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    if (pageIndex > 1) {
      setIsLoading(true)
    }

    try {
      const response = await getRole(pageIndex, pageSize, globalTerm, arrRole);
      const formattedData =
        response?.data?.source?.map((x: DataRole) => ({
          id: x.id,
          userName: x.userName,
          role: x.role,
          email: x.email,
          fullName: x.fullName,
          isAdmin: x.isAdmin,
          groupSystemId: x.groupSystemId,
          groupSystemName: x.groupSystemName,
          groupBranchId: x.groupBranchId,
          groupBranchName: x.groupBranchName,
          groupTeamId: x.groupTeamId,
          password: x.password,
        })) || [];

      setTotalRecord(response?.data?.totalRecords || 0);
      setDataRolePage((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchListRole(globalTerm);
  }, [keys]);

  const getGroupSystems = async () => {
    try {
      const getSystem = await getGroupSystem(1, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = getSystem?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
      }));
      setGroupSystem(res);
    } catch (error) {
      console.error(error);
    }
  };

  const getBranchSystems = async () => {
    try {
      const getBranch = await getBranchSystem(1, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = getBranch?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
      }));
      setBranchSystem(res);
    } catch (error) {
      console.error("Lỗi khi gọi hàm getBranchSystem:", error);
    }
  };

  const getGroupTeams = async () => {
    try {
      const groupTeams = await getGroupTeam(1, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = groupTeams?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
      }));
      setGroupTeam(res);
    } catch (error) {
      console.log(error);
    }
  };

  const ValidateUser = (userName?: string) => {
    if (!userName.includes("@vinara.net")) {
      toast.error("Sai định dạng Email. Email bắt buộc phải có đuôi @vinara.net");

      return false;
    }
    return true;
  }

  const ClearFilter = () => {
    setGlobalTerm("");
  }

  const handleAddConfirm = async (isAddRole: boolean) => {
    // const formData = form.getFieldsValue();
    try {
      await form.validateFields();

      const userName = form.getFieldsValue().userName;
      if (!ValidateUser(userName)) {
        return;
      }

      setIsAddRole(isAddRole);

      const formData = form.getFieldsValue();
      const roleData = {
        id: currentRole ? currentRole.id : formData.id,
        userName: formData.userName,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        isAdmin: formData.isAdmin,
        groupSystemId: formData.groupSystemName,
        groupBranchId: formData.groupBranchName,
        groupTeamId: formData.groupTeamId,
        password: formData.password,
      };

      // Gửi dữ liệu vai trò tới máy chủ và lưu phản hồi
      const response = await addRole(roleData);

      // Kiểm tra phản hồi từ máy chủ
      if (response && response.success === false) {
        throw new Error(response.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
      setIsAddModalOpen(false);

      form.resetFields();
      setCurrentRole(null);
      await setPageIndex(1);
      await setDataRolePage([]);
      ClearFilter();

      fetchListRole();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error(error.message);
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setIsAddRole(false);
      setLoading(false);
    }
  };

  // sửa
  const handleEdit = (record: DataRole) => {
    setCurrentRole(record);

    form.setFieldsValue({
      id: record.id,
      userName: record.userName,
      email: record.email,
      fullName: record.fullName,
      role: record.role,
      isAdmin: record.isAdmin,
      groupSystemId: record.groupSystemId,
      groupSystemName: record.groupSystemName,
      groupBranchId: record.groupBranchId,
      groupBranchName: record.groupBranchName,
      groupTeamId: record.groupTeamId,
      password: record.password,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteRole = async (role: DataRole) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteRole([role.id]);
      await setPageIndex(1);
      await setDataRolePage([]);
      ClearFilter();

      fetchListRole();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
    } finally {
      setLoading(false);
      toast.success("Xóa nhóm quyền thành công");
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getRole(1, 20);
        const formattedData =
          data?.data?.source?.map((x: DataRole) => ({
            id: x.id,
            userName: x.userName,
            fullName: x.fullName,
          })) || [];

        setDataRolePage(formattedData);
      } else {
        // Nếu có giá trị tìm kiếm, gọi API với giá trị đó
        const data = await getRole(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: DataRole) => ({
            id: x.id,
            userName: x.userName,
            fullName: x.fullName,
          })) || [];

        setDataRolePage(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataRole | null>(null);

  const handleDeleteClick = (tele: DataRole) => {
    setSelectedAccountGroup(tele);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDeleteRole(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Email đăng nhập", dataIndex: "userName", key: "userName" },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    {
      title: "Hệ thống",
      dataIndex: "groupSystemId",
      key: "groupSystemId",
      hidden: true,
    },
    {
      title: "Chi nhánh",
      dataIndex: "groupBranchId",
      key: "groupBranchId",
      hidden: true,
    },
    {
      title: "Tên hệ thống",
      dataIndex: "groupSystemName",
      key: "groupSystemName",
      hidden: true,
    },
    {
      title: "Tên chi nhánh",
      dataIndex: "groupBranchName",
      key: "groupBranchName",
      hidden: true,
    },
    {
      title: "Đội nhóm",
      dataIndex: "groupTeamId",
      key: "groupTeamId",
      hidden: true,
    },
    {
      title: "Chức năng",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (record: DataRole) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteClick(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataRolePage.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const res = await deleteRole(idsToDelete);

      if (!res || !res.success) {
        toast.error(res?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataRolePage([]);
        ClearFilter();

        fetchListRole();
        setSelectedRowKeys([]);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletes = () => {
    handleDeletes();
    setIsModalVisible(false);
  };

  const handleDeleteConfirmation = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách quyền</div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm email hoặc họ tên..."
            style={{
              width: 253,
              marginRight: 15,
            }}
            onChange={async (e) => {
              const value = e.target.value;
              setGlobalTerm(value);
            }}
            onPressEnter={async (e) => {
              const inputValue = (e.target as HTMLInputElement).value;
              await setPageIndex(1);
              await setDataRolePage([])
              handleSearch(inputValue);
            }}
            value={globalTerm}
          />
          <div className="flex">
            {selectedRowKeys.length > 0 && (
              <Button
                className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
                onClick={handleDeleteConfirmation}
              >
                Xóa nhiều
              </Button>
            )}
            <div className="w-2" />
            <Button
              className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
              onClick={() => {
                setCurrentRole(null);
                form.resetFields();
                setIsAddModalOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <LoadingTable
          loading={loading}
          pageIndex={pageIndex}
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
        />
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={currentRole ? "Chỉnh sửa quyền" : "Thêm mới quyền"}
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-1 w-full"
        >
          <Form.Item hidden label="id" name="id">
            <Input hidden autoComplete="off" />
          </Form.Item>

          <Form.Item label="Vai trò" name="isAdmin" valuePropName="checked">
            <Checkbox
              onChange={(e) => {
                setRole(e.target.checked);
              }}
              checked={role}
            >
              Admin
            </Checkbox>
          </Form.Item>

          {!role && (
            <>
              <Form.Item label="Hệ thống" name="groupSystemName">
                <Select
                  allowClear
                  placeholder="Chọn hệ thống"
                  onFocus={getGroupSystems}
                  options={groupSystem}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSystemId(value);
                    getBranchSystems();
                  }}
                  value={systemId}
                />
              </Form.Item>
              <Form.Item label="Chọn chi nhánh" name="groupBranchName">
                <Select
                  allowClear
                  placeholder="Chọn chi nhánh"
                  onFocus={getBranchSystems}
                  options={branchSystem}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setParentId(value);
                    getGroupTeams();
                  }}
                  value={parentId}
                />
              </Form.Item>
              <Form.Item label="Chọn đội nhóm" name="groupTeamId">
                <Select
                  allowClear
                  placeholder="Chọn đội nhóm"
                  onFocus={getGroupTeams}
                  options={groupTeam}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Họ và tên" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Email đăng nhập"
            name="userName"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Email đăng nhập" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu" autoComplete="new-password" />
          </Form.Item>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsAddModalOpen(false)}
              className="w-[189px] !h-10"
            >
              Đóng
            </Button>
            <div className="w-5" />
            <Button
              type="primary"
              onClick={() => handleAddConfirm(true)}
              className={`${isAddRole && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddRole}
            >
              {currentRole ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        role={selectedAccountGroup}
      />
      <DeleteModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onConfirm={handleConfirmDeletes}
        handleDeleteTele={async () => {
          await handleDeletes();
          setIsModalVisible(false);
        }}
      />
    </>
  );
};
export default Role;
