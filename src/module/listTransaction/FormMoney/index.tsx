import {
  FormMoneyType,
  FaceValueType,
  ItemFaceValueChooseType,
} from "@/src/common/type";
import { getTypeAsset } from "@/src/services/bankAccount";
import { apiClient } from "@/src/services/base_api";
import {
  formatCurrencyUSD,
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

export const FormMoney = ({ onCancel, fetchData }: FormMoneyType) => {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();

  const [listType, setListType] = useState([]);
  const [listTransType, setListTransType] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [listFaceValue, setListFaceValue] = useState([]);
  const [faceValueChoose, setFaceValueChoose] = useState<
    ItemFaceValueChooseType[]
  >([]);
  const [faceValueList, setFaceValueList] = useState([]);
  const [selectedValues, setSelectedValues] = useState<string | string[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isCreateMoney, setIsCreateMoney] = useState<boolean>(false);

  const getlistTypeAsset = async () => {
    try {
      const listTypeAsset = await getTypeAsset({
        cdType: "TRANS_CASH",
        cdName: "TYPE",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listTypeAssetConvert = listTypeAsset.map((item: any) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      setListType(listTypeAssetConvert);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { }
  };

  const getListTransType = async () => {
    try {
      const listTypeAsset = await getTypeAsset({
        cdType: "TRANS_CASH",
        cdName: "TRANS_TYPE",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listTypeAssetConvert = listTypeAsset.map((item: any) => {
        return { label: item.vnContent, value: item.cdVal };
      });

      setListTransType(listTypeAssetConvert);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { }
  };

  const getListFaceValue = async () => {
    try {
      const data = form.getFieldsValue();
      const listFaceValue = await getTypeAsset({
        cdType: "TRANS_CASH",
        cdName: data.type === "1" ? "FACE_VALUE_VND" : "FACE_VALUE_USD",
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
    } catch (error) { }
  };

  const handleChooseFaceValue = (value: string | string[]) => {
    setFaceValueChoose(
      faceValueList.filter((item: ItemFaceValueChooseType) =>
        value.includes(item.value)
      )
    );
    setSelectedValues(value);
  };

  useEffect(() => {
    startTransition(() => {
      Promise.all([getlistTypeAsset(), getListTransType()]);
    });
  }, []);

  const total = faceValueChoose.reduce((sum, item) => {
    const labelAsNumber = parseLabelToNumber(item.label ?? "0");
    const quantity = item.quantity || 0;
    return sum + quantity * labelAsNumber;
  }, 0);

  let formattedTotal = "";
  const dataForm = form.getFieldsValue();

  if (dataForm.type === "1") {
    formattedTotal = formatCurrencyVN(`${total}`);
  } else {
    formattedTotal = formatCurrencyUSD(`${total}`);
  }

  form.setFieldsValue({
    totalAmount: formattedTotal,
  });

  const handleSubmit = async (isCreateMoney: boolean) => {
    try {
      await form.validateFields();
      setIsCreateMoney(isCreateMoney);
      const formData = form.getFieldsValue();
      const params = {
        transDate: selectedDate,
        transType: formData.transType,
        purposeTrans: "1",
        type: formData.type,
        addedBy: formData.addedBy,
        managerBy: formData.managerBy,
        departmentManager: formData.departmentManager,
        totalAmount: total,
        assetInventories: faceValueChoose.map((item) => {
          if (formData.type === "2") {
            return {
              value: item.value,
              quantity: item.quantity,
              price: exchangeRate,
            };
          }
          return {
            value: item.value,
            quantity: item.quantity,
          };
        }),
        note: formData.note ?? "",
      };
      const responsiove = await apiClient.post(
        "/asset-api/add-or-update",
        params,
        {
          timeout: 30000,
        }
      );

      if (responsiove.data.message && !responsiove.data.success) {
        toast.error(responsiove.data.message);
      } else {
        fetchData({});
        onCancel();
        toast.success(responsiove.data.message || "Thêm mới thành công!");
        form.resetFields();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setIsCreateMoney(false);
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
              label="Loại tiền"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại tiền!" }]}
            >
              <Select
                options={listType}
                placeholder="Chọn loại tiền"
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={() => {
                  setListFaceValue([]);
                  setFaceValueChoose([]);
                  setSelectedValues([]);
                  startTransition(() => {
                    getListFaceValue();
                  });
                }}
              />
            </Form.Item>
            {dataForm.type === "2" && (
              <Form.Item
                label="Tỷ giá"
                name="exchange-rate"
                rules={[{ required: true, message: "Vui lòng chọn tỷ giá!" }]}
              >
                <InputNumber<number>
                  placeholder="Chọn tỷ giá"
                  min={1}
                  onChange={(value) => setExchangeRate(value ?? 0)}
                  className="w-full input-number-rate-custom"
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
            )}
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
              label="Mệnh giá"
              name="assetInventories"
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
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    handleChooseFaceValue(value);
                    form.setFieldsValue({
                      assetInventories: value,
                    });
                  }}
                  tokenSeparators={[","]}
                  options={listFaceValue}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  value={selectedValues}
                  className={`${dataForm.type ? "" : "pointer-events-none"}`}
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
                          <span>{itemFaceValue.label}</span>
                          <div className="flex gap-4">
                            <Button
                              onClick={() => handleClickDesc(index)}
                              className={`${itemFaceValue.quantity === 1 &&
                                "pointer-events-none"
                                } !h-10 w-10`}
                            >
                              -
                            </Button>
                            <InputNumber
                              min={1}
                              value={itemFaceValue.quantity}
                              className="input-number-custom"
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
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Chọn loại giao dịch"
              />
            </Form.Item>

            <Form.Item
              label="Người giao dịch"
              name="addedBy"
              rules={[
                { required: true, message: "Vui lòng chọn người giao dịch!" },
              ]}
            >
              <Input
                placeholder="Nhập tên người giao dịch"
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item
              label="Người quản lý"
              name="managerBy"
              rules={[
                { required: true, message: "Vui lòng chọn người quản lý!" },
              ]}
            >
              <Input placeholder="Nhập tên người quản lý" autoComplete="off" />
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
            <Form.Item label="Tổng tiền" name="totalAmount">
              <InputNumber className="input-number-custom-total" readOnly />
            </Form.Item>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea
                placeholder="Nhập ghi chú"
                autoSize={{ minRows: 3, maxRows: 5 }}
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
                  className={`${isCreateMoney && "pointer-events-none"
                    } w-[189px] !h-10 bg-[#4B5CB8] hover:bg-[#3A4A9D]`}
                  loading={isCreateMoney}
                >
                  Tiếp tục
                </Button>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
      <Spin
        className={`${isPending ? "!absolute top-[50%] left-[50%]" : "!hidden"
          }`}
      />
    </div>
  );
};
