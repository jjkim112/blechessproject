"use client";
import React, { FC, ReactNode, useEffect } from "react";
import Link from "next/link";
import "./HeaderStyles.css";
import Image from "next/image";
import { GOERLI_CHAIN_ID, ethereum, web3 } from "@/lib/web3.config";
import { useContext } from "react";
import { AppContext } from "@/app/layout";
import useSWR from "swr";
import { useTicketProjectList } from "@/context/contractContext";
import { OneProject } from "@/domain/OneProject";
import { getWholeTicketContractList, onClickLogin } from "@/utils/web3/web3_v2";
interface HeaderProps {
  className?: string;
  children?: ReactNode;
}

const HeaderCustom: FC<HeaderProps> = () => {
  const { account, setAccount } = useContext(AppContext);
  const onClickLogIn = async () => {
    const walletAddr = await onClickLogin();
    if (walletAddr !== null) {
      setAccount(walletAddr);
    }
  };

  const { updateProjects, updateTickets, getProject, projects } =
    useTicketProjectList();

  const testFunc1 = async () => {
    await updateProjects(["1234", "2345"]);
    console.log("finish");
  };

  const testFunc2 = async () => {
    await updateTickets("1234");
    console.log("finish");
  };
  const testFunc3 = async () => {
    const addrs = await getWholeTicketContractList();
    console.log("addrs");
    console.log(addrs);
  };
  useEffect(() => {
    const temp: OneProject | null = getProject("1234");
    console.log(temp);
  }, [projects]);

  return (
    <div className="header_inner  ">
      <header className="header-wrapper-home inner">
        <nav className="navbar-home">
          <Link href="/">
            <Image
              className="logo"
              src={`/images/logo.png`}
              width={100}
              height={50}
              alt=""
            />
          </Link>

          <Link href="/project">
            <div className="header-menu-item">프로젝트</div>
          </Link>
          <Link href="/profile">
            <div className="header-menu-item">프로필</div>
          </Link>
          <div onClick={testFunc1}>
            <div className="header-menu-item">테스트 버튼1</div>
          </div>
          <div onClick={testFunc2}>
            <div className="header-menu-item">테스트 버튼2</div>
          </div>
          <div onClick={testFunc3}>
            <div className="header-menu-item">테스트 버튼3</div>
          </div>
        </nav>
        {account ? (
          <div className="connect-wallet-button">
            {account.substring(0, 4)}...{account.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-button" onClick={onClickLogIn}>
            Connect Wallet
          </button>
        )}
      </header>
    </div>
  );
};

export default HeaderCustom;
