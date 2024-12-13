"use client";
import imgrb from "../../../../public/img/imgrb.png";
import imgrt from "../../../../public/img/imgrt.png";
import imglb from "../../../../public/img/imglb.png";
import imglt from "../../../../public/img/imglt.png";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { authenticatorResponse } from "@/src/utils/action";
import { useState } from "react";
import { Button } from "antd";

function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const res = await authenticatorResponse(username, password);
    if (res.error) {
      setIsLoading(false);
      toast.error(res.error);
    } else {
      router.push("/dashboard");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="bg-[#4880FF] w-full min-h-screen flex justify-center items-center relative">
      <div className="w-full max-w-[90%] sm:max-w-[630px] bg-white p-6 sm:p-8 rounded-lg shadow-md flex flex-col z-10">
        <h2 className="text-center text-lg sm:text-xl font-semibold">
          Đăng nhập tài khoản
        </h2>
        <div className="mb-4 text-center">
          Vui lòng điền email đăng nhập và mật khẩu để đăng nhập hệ thống
        </div>

        <label htmlFor="email" className="mb-2">
          Email
        </label>
        <input
          id="email"
          placeholder="Nhập email của bạn"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <label htmlFor="password" className="mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          placeholder="Nhập mật khẩu của bạn"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="remember"
            className="mr-2"
            autoComplete="off"
          />
          <label htmlFor="remember">Lưu đăng nhập</label>
        </div>

        <div className="flex flex-col justify-center items-center">
          <Button
            onClick={() => handleLogin()}
            className="!bg-blue-500 !text-white rounded hover:!bg-blue-600 transition duration-200 w-full !h-12 font-bold !text-lg"
            loading={isLoading}
          >
            Đăng nhập
          </Button>
        </div>
      </div>

      <div>
        <Image
          alt="img"
          src={imgrb}
          className="absolute"
          style={{
            right: 0,
            bottom: 0,
            opacity: 0.6,
            width: "30%",
          }}
        />
        <Image
          alt="img"
          src={imgrt}
          className="absolute"
          style={{
            right: 0,
            top: 0,
            width: "30%",
          }}
        />
        <Image
          alt="img"
          src={imglb}
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            opacity: 0.6,
            width: "30%",
          }}
        />
        <Image
          alt="img"
          src={imglt}
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: "30%",
          }}
        />
      </div>
    </div>
  );
}

export default LoginForm;
