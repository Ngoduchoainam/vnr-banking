import {
  FormMoneyType,
  FaceValueType,
  ItemFaceValueChooseType,
} from "@/src/common/type";
import { getTypeAsset } from "@/src/services/bankAccount";
import { apiClient } from "@/src/services/base_api";
import {
  formatCurrencyVN,
  parseLabelToNumber,
  disabledDateFeature,
  disabledTimeFeature,
} from "@/src/utils/buildQueryParams";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { Dayjs } from "dayjs";
import { useEffect, useState, useTransition } from "react";
import { toast } from "react-toastify";
import type { InputNumberProps } from "antd";

export const FormCash = ({ onCancel, fetchData }: FormMoneyType) => {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();

  const [listTransType, setListTransType] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [listFaceValue, setListFaceValue] = useState([]);
  const [faceValueChoose, setFaceValueChoose] = useState<
    ItemFaceValueChooseType[]
  >([]);
  const [faceValueList, setFaceValueList] = useState([]);
  const [selectedValues, setSelectedValues] = useState<string | string[]>([]);
  const [realEstateList, setRealEstateList] = useState([]);
  const [realEstateChoose, setRealEstateChoose] = useState<
    ItemFaceValueChooseType[]
  >([]);
  const [listRealEstate, setListRealEstate] = useState([]);
  const [notification, setNotification] = useState({
    isCompare: false,
    message: "",
  });

  const [isCreateRealCash, setIsCreateRealCash] = useState<boolean>(false);

  const getListTransType = async () => {
    try {
      const listTypeAsset = await getTypeAsset({
        cdType: "TRANS_REAL_ESTATE",
        cdName: "TRANS_TYPE",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listTypeAssetConvert = listTypeAsset.map((item: any) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      setListTransType(listTypeAssetConvert);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
  };

  const getListRealEstate = async () => {
    try {
      const listRealEstate = await getTypeAsset({
        cdType: "TRANS_REAL_ESTATE",
        cdName: "REAL_ESTATE_TYPE",
      });

      const listGoldConvert = listRealEstate.map((item: FaceValueType) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      const goldTotalConvert = listRealEstate.map((item: FaceValueType) => {
        return {
          value: item.cdVal,
          label: item.vnContent,
          quantity: 1,
          price: 0,
        };
      });
      setRealEstateList(goldTotalConvert);
      setListRealEstate(listGoldConvert);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
  };

  const getListFaceValue = async () => {
    try {
      const listFaceValue = await getTypeAsset({
        cdType: "TRANS_CASH",
        cdName: "FACE_VALUE_VND",
      });

      const listFaceConvert = listFaceValue.map((item: FaceValueType) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      const faceValueTotalConvert = listFaceValue.map((item: FaceValueType) => {
        return {
          value: item.cdVal,
          label: item.vnContent,
          quantity: 1,
          price: 0,
        };
      });
      setFaceValueList(faceValueTotalConvert);
      setListFaceValue(listFaceConvert);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
  };

  useEffect(() => {
    startTransition(() => {
      Promise.all([
        getListTransType(),
        getListRealEstate(),
        getListFaceValue(),
      ]);
    });
  }, []);

  const handleChooseFaceValue = (value: string | string[]) => {
    setFaceValueChoose(
      faceValueList.filter((item: ItemFaceValueChooseType) =>
        value.includes(item.value)
      )
    );
    setSelectedValues(value);
  };

  const handleChooseRealEstate = (value: string | string[]) => {
    setRealEstateChoose(
      realEstateList.filter((item: ItemFaceValueChooseType) =>
        value.includes(item.value)
      )
    );
  };

  const totalAmount = faceValueChoose.reduce((sum, item) => {
    const labelAsNumber = parseLabelToNumber(item.label ?? "0");
    const quantity = item.quantity || 0;
    return sum + quantity * labelAsNumber;
  }, 0);

  form.setFieldsValue({
    totalAmount: formatCurrencyVN(`${totalAmount}`),
  });

  const handleSubmit = async (isCreateRealCash: boolean) => {
    await form.validateFields();
    const formData = form.getFieldsValue();
    const totalMoneyReal = realEstateChoose.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    if (totalAmount - totalMoneyReal > 1000) {
      setNotification((prev) => ({
        ...prev,
        isCompare: true,
        message: "Tổng số tiền lớn hơn tổng giá trị mua!",
      }));
    } else if (totalAmount - totalMoneyReal < 0) {
      setNotification((prev) => ({
        ...prev,
        isCompare: true,
        message: "Tổng số tiền lớn nhỏ hơn tổng giá trị mua!",
      }));
    } else {
      setNotification((prev) => ({
        ...prev,
        isCompare: false,
        message: "",
      }));
      const params = {
        transDate: selectedDate,
        transType: formData.transType,
        purposeTrans: "3",
        type: formData.type,
        addedBy: formData.addedBy,
        managerBy: formData.managerBy,
        departmentManager: formData.departmentManager,
        cashAddedBy: formData.cashAddedBy,
        cashManagerBy: formData.cashManagerBy,
        cashDepartmentManager: formData.cashDepartmentManager,
        totalAmount: totalAmount,
        assetInventories: realEstateChoose.map((item) => {
          return {
            value: item.value,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        cashAssetInventories: faceValueChoose.map((item) => {
          return { value: item.value, quantity: item.quantity };
        }),
        paymentType: "2",
        note: formData.note ?? "",
      };
      try {
        setIsCreateRealCash(isCreateRealCash);
        const responsive = await apiClient.post(
          "/asset-api/add-or-update",
          params,
          {
            timeout: 30000,
          }
        );
        if (responsive.data.success) {
          toast.success(
            responsive.data.message || "Thêm mới giao dịch vàng thành công!"
          );
          fetchData({});
          onCancel();
          form.resetFields();
        } else {
          toast.error(responsive.data.message || "Giao dịch bị lỗi!");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
      } finally {
        setIsCreateRealCash(false);
      }
    }
  };

  return (
    <div className="relative">
      <Form
        form={form}
        layout="vertical"
        className="flex flex-col gap-1 w-full"
      >
        <Row gutter={[40, 0]}>
          <Col span={12}>
            <Form.Item
              label="Thời gian giao dịch"
              name="transDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian giao dịch!",
                },
              ]}
            >
              <Space direction="vertical" size="large" className="w-full">
                <DatePicker
                  className="w-full"
                  showTime
                  required
                  disabledDate={disabledDateFeature}
                  disabledTime={disabledTimeFeature}
                  onChange={async (value: Dayjs | null) => {
                    const formattedDate = await value?.format(
                      "YYYY-MM-DDTHH:mm:ss.SSSZ"
                    );
                    setSelectedDate(formattedDate!);
                    form.setFieldsValue({
                      transDate: formattedDate,
                    });
                  }}
                />
              </Space>
            </Form.Item>
            <Form.Item
              label="Người mua"
              name="addedBy"
              rules={[{ required: true, message: "Vui lòng chọn người mua!" }]}
            >
              <Input placeholder="Nhập tên người mua" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Người quản lý"
              name="managerBy"
              rules={[
                { required: true, message: "Vui lòng chọn người quản lý!" },
              ]}
            >
              <Input placeholder="Nhập tên quản lý" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Bộ phận quản lý"
              name="departmentManager"
              rules={[
                { required: true, message: "Vui lòng chọn bộ phận quản lý!" },
              ]}
            >
              <Input placeholder="Bộ phận quản lý" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Loại hình bất động sản"
              name="assetInventories"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại hình bất động sản!",
                },
              ]}
            >
              <Space direction="vertical" size="large" className="w-full">
                <Select
                  placeholder="Chọn loại hình bất động sản"
                  mode="tags"
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    handleChooseRealEstate(value);
                    form.setFieldsValue({
                      assetInventories: value,
                    });
                  }}
                  tokenSeparators={[","]}
                  options={listRealEstate}
                />
              </Space>
            </Form.Item>

            {realEstateChoose.length > 0 && (
              <Form.Item name="total-money">
                <div className="flex flex-col gap-3 p-4 border border-[#e5e7eb] rounded-lg">
                  <div className="flex items-center justify-between mb-2 border-b border-b-[#979797]">
                    <span className="inline-block w-[30%]">Loại nhà</span>
                    <span className="inline-block w-[40%]">Giá</span>
                    <span className="inline-block w-[30%]">Số lượng</span>
                  </div>
                  {realEstateChoose?.map(
                    (itemFaceValue: ItemFaceValueChooseType, index: number) => {
                      const handleClickDesc = (index: number) => {
                        if (itemFaceValue.quantity > 1) {
                          const newList = [...realEstateChoose];
                          newList[index].quantity -= 1;
                          setRealEstateChoose(newList);
                        }
                      };
                      const handleClickAsc = (index: number) => {
                        const newList = [...realEstateChoose];
                        newList[index].quantity += 1;
                        setRealEstateChoose(newList);
                      };

                      const handleChangePrice = (
                        value: number,
                        index: number
                      ) => {
                        const newList = [...realEstateChoose];
                        newList[index].price = value;
                        setRealEstateChoose(newList);
                      };

                      const onChangeQuantityReal: InputNumberProps["onChange"] =
                        (value) => {
                          const newList = [...realEstateChoose];
                          if ((value as number) > 1) {
                            newList[index].quantity = value as number;
                            setRealEstateChoose(newList);
                          } else {
                            newList[index].quantity = 1;
                            setRealEstateChoose(newList);
                          }
                        };

                      return (
                        <div
                          key={itemFaceValue.value}
                          className="flex justify-between"
                        >
                          <span className="inline-flex flex-shrink-0 w-[110px] mt-2">
                            {itemFaceValue.label}
                          </span>
                          <Form.Item
                            name={`price.${index}`}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập bất động sản!",
                              },
                            ]}
                          >
                            <InputNumber<number>
                              min={0}
                              onChange={(value) =>
                                handleChangePrice(value ?? 0, index)
                              }
                              placeholder="Nhập giá bất động sản"
                              className="input-number-price-custom w-[120px]"
                              formatter={(value) =>
                                value
                                  ? `${new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                      maximumFractionDigits: 0,
                                    }).format(Number(value))}`
                                  : ""
                              }
                              parser={(value) =>
                                value?.replace(/\D/g, "") as unknown as number
                              }
                            />
                          </Form.Item>
                          <div className="flex gap-4">
                            <Button
                              onClick={() => handleClickDesc(index)}
                              className={`${
                                itemFaceValue.quantity === 1 &&
                                "pointer-events-none"
                              } !h-10 w-10`}
                            >
                              -
                            </Button>
                            <InputNumber
                              min={1}
                              max={100000}
                              value={itemFaceValue.quantity}
                              className="input-number-custom !h-10 w-8"
                              onChange={onChangeQuantityReal}
                            />
                            <Button
                              onClick={() => handleClickAsc(index)}
                              className="!h-10 w-10"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </Form.Item>
            )}

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea
                placeholder="Nhập ghi chú"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loại giao dịch"
              name="transType"
              rules={[
                { required: true, message: "Vui lòng chọn loại giao dịch!" },
              ]}
            >
              <Select
                options={listTransType}
                placeholder="Chọn loại giao dịch"
              />
            </Form.Item>
            <Form.Item
              label="Người chi tiền"
              name="cashAddedBy"
              rules={[
                { required: true, message: "Vui lòng chọn người chi tiền!" },
              ]}
            >
              <Input placeholder="Nhập tên chi tiền" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Người quản lý"
              name="cashManagerBy"
              rules={[
                { required: true, message: "Vui lòng chọn người quản lý!" },
              ]}
            >
              <Input placeholder="Nhập tên quản lý" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Bộ phận quản lý"
              name="cashDepartmentManager"
              rules={[
                { required: true, message: "Vui lòng chọn bộ phận quản lý!" },
              ]}
            >
              <Input placeholder="Bộ phận quản lý" autoComplete="off" />
            </Form.Item>

            <Form.Item
              label="Mệnh giá"
              name="cashAssetInventories"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn mệnh giá!",
                },
              ]}
            >
              <Space direction="vertical" size="large" className="w-full">
                <Select
                  placeholder="Chọn mệnh giá"
                  mode="tags"
                  onChange={(value) => {
                    handleChooseFaceValue(value);
                    form.setFieldsValue({
                      cashAssetInventories: value,
                    });
                  }}
                  tokenSeparators={[","]}
                  options={listFaceValue}
                  value={selectedValues}
                />
              </Space>
            </Form.Item>

            {faceValueChoose.length > 0 && (
              <Form.Item
                label="Số lượng tờ tiền của từng mệnh giá"
                name="total-money"
              >
                <div className="flex flex-col gap-3 p-4 border border-[#e5e7eb] rounded-lg">
                  {faceValueChoose?.map(
                    (itemFaceValue: ItemFaceValueChooseType, index: number) => {
                      const handleClickDesc = (index: number) => {
                        if (itemFaceValue.quantity > 1) {
                          const newList = [...faceValueChoose];
                          newList[index].quantity -= 1;
                          setFaceValueChoose(newList);
                        }
                      };
                      const handleClickAsc = (index: number) => {
                        const newList = [...faceValueChoose];
                        newList[index].quantity += 1;
                        setFaceValueChoose(newList);
                      };
                      const onChangeQuantityMoney: InputNumberProps["onChange"] =
                        (value) => {
                          const newList = [...faceValueChoose];
                          if ((value as number) > 1) {
                            newList[index].quantity = value as number;
                            setFaceValueChoose(newList);
                          } else {
                            newList[index].quantity = 1;
                            setFaceValueChoose(newList);
                          }
                        };

                      return (
                        <div
                          key={itemFaceValue.value}
                          className="flex justify-between"
                        >
                          <span className="mt-2">{itemFaceValue.label}</span>
                          <div className="flex gap-4">
                            <Button
                              onClick={() => handleClickDesc(index)}
                              className={`${
                                itemFaceValue.quantity === 1 &&
                                "pointer-events-none"
                              } !h-10 w-10`}
                            >
                              -
                            </Button>
                            <InputNumber
                              min={1}
                              value={itemFaceValue.quantity}
                              className="input-number-custom !h-10 w-8"
                              onChange={onChangeQuantityMoney}
                            />
                            <Button
                              onClick={() => handleClickAsc(index)}
                              className="!h-10 w-10"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </Form.Item>
            )}
            {notification.isCompare && (
              <p className="text-[#ff4d4f] text-sm mb-4 -mt-3">
                {notification?.message}
              </p>
            )}

            <Form.Item
              label="Tổng tiền"
              name="totalAmount"
              rules={[
                { required: true, message: "Vui lòng chọn người tổng tiền!" },
              ]}
            >
              <InputNumber
                className="input-number-custom-total"
                placeholder="Tổng tiền:"
                readOnly
              />
            </Form.Item>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={onCancel} className="w-[189px] !h-10">
                Đóng
              </Button>
              <Form.Item className="!my-auto">
                <Button
                  type="primary"
                  onClick={() => {
                    handleSubmit(true);
                  }}
                  className={`${
                    isCreateRealCash && "pointer-events-none"
                  } w-[189px] !h-10 bg-[#4B5CB8] hover:bg-[#3A4A9D]`}
                  loading={isCreateRealCash}
                >
                  Tiếp tục
                </Button>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
      <Spin
        className={`${
          isPending ? "!absolute top-[50%] left-[50%]" : "!hidden"
        }`}
      />
    </div>
  );
};
