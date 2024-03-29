"use client";
import React, { ReactNode, useEffect, useState, useContext } from "react";
import "./ProjectStyles.css";
import OneQuestPart, { Quest } from "./OneQuestPart";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import OneTicketThumb from "./OneTicketThumb";
import {
  dateToStr,
  dateToStrEng,
  msToPeriodStrEng,
  oneDayDateNumber,
} from "@/utils/date_util";
import {
  attendance,
  attendancePointCheck,
  getMyLastTimeOfAttendance,
  ticketBuying,
} from "@/utils/web3/web3_v2";
import { AppContext } from "@/app/layout";
import { OneTicket } from "@/domain/OneTicket";
import { OneProject } from "@/domain/OneProject";

// export interface ProjectData {
//   id: number;
//   contract: string;
//   title: string;
//   description: string;
//   imgUrl: string;
//   quests: Quest[];
// }

interface OneProjectPartProps {
  projectData: OneProject | null;
}

function OneProjectPart({ projectData, ...restProps }: OneProjectPartProps) {
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  function ticketClick(ticketId: number) {
    // 클릭한 카드의 ID에 따라 상태값 변경
    setSelectedId(ticketId === selectedId ? null : ticketId);
    console.log("Clicked Ticket : " + ticketId);
  }

  // const [count, setCount] = useState<number[]>([]);
  const [count, setCount] = useState<number>(0);
  const { account } = useContext(AppContext);
  const clickPurchaseBtn = () => {
    if (selectedId !== null) {
      setOpenDialog(true);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };
  const purchaseTicket = async () => {
    if (selectedId !== null) {
      let temp: OneTicket | null = null;

      for (
        let index = 0;
        index < (projectData?.tickets ?? []).length;
        index++
      ) {
        const oneTicket = projectData!.tickets[index];
        if (oneTicket.id === selectedId) {
          temp = oneTicket;
          break;
        }
      }
      if (temp !== null) {
        const response = await ticketBuying(
          selectedId,
          temp.price,
          temp.contract,
          account
        );
        console.log("구매 함수 구매함수!!!!");
        console.log(response);
      } else {
      }
      // TODO response 성공/실패 확인
    }

    setOpenDialog(false);
  };
  useEffect(() => {
    setInterval(() => {
      setNowTime(Date.now());
    }, 100);
  }, []);
  useEffect(() => {
    getAttendance();
    getLastTime();
  }, []);

  const getAttendance = async () => {
    const attendenceNum = await attendancePointCheck(
      projectData!.contract,
      account
    );
    if (attendenceNum !== null) {
      console.log("count set as " + attendenceNum);
      setCount(attendenceNum);
    }
    console.log(attendenceNum);
  };

  const getLastTime = async () => {
    const lastCheckTime = await getMyLastTimeOfAttendance(
      projectData!.contract,
      account
    );
    console.log("lastCheckTime");
    console.log(new Date(blockTimeToNextJSTime(lastCheckTime)));
    if (lastCheckTime !== null) {
      setLastCheckTime(blockTimeToNextJSTime(lastCheckTime));
      // setLastCheckTime((v) => Date.now() + 10000);
    }
  };

  const clickAttendance = async () => {
    if (nowTime >= lastCheckTime) {
      // TODO await attendance 함수 실행
      const response = await attendance(projectData!.contract, account);
      // TODO await get User Attendance 함수 호출
      if (true) {
        await getAttendance();
      }
      await getLastTime();
    }
  };
  const blockTimeToNextJSTime = (value: number) => {
    return value * 1000;
  };

  if (projectData !== null) {
    return (
      <div className="w-full flex justify-center">
        <div className="inner">
          <img className="project-img" src={projectData.imgUrl} alt="" />
          <div className="project-title">{projectData.title}</div>
          <div className="project-description">{projectData.description}</div>
          <div className="text-center">티켓 목록</div>
          <div className="mx-auto flex flex-wrap w-1/2">
            {projectData &&
              projectData.tickets.map((v, i) => {
                return (
                  <OneTicketThumb
                    key={`${v.contract}_${v.id}`}
                    value={v}
                    isClicked={selectedId === v.id}
                    onClick={() => {
                      ticketClick(v.id);
                    }}
                    nowCount={count}
                  />
                );
              })}
          </div>

          <div className="flex flex-wrap justify-center my-3 w-[80%] mx-auto text-[20px]">
            출석일 수 : {count}
          </div>
          {nowTime > lastCheckTime + oneDayDateNumber ? (
            <div
              className="flex flex-col justify-center items-center mx-auto hover:cursor-pointer border-[1px] border-black rounded-3xl w-[300px] py-2 text-center"
              onClick={clickAttendance}
            >
              <div className="text-[18px] font-bold mb-1">출석하기</div>
              {lastCheckTime !== 0 ? (
                <div className="text-[12px] text-gray-300">{`최근 출석 : ${dateToStrEng(
                  new Date(lastCheckTime)
                )}`}</div>
              ) : null}
              {/* <div className="text-[12px] text-gray-300">{`최근 출석 : ${dateToStrEng(
                new Date(lastCheckTime)
              )}`}</div> */}
            </div>
          ) : (
            <div className="flex justify-center mx-auto border-[1px] border-black rounded-3xl w-[300px] py-2 text-center">
              <div className="mr-[4px]">남은 시간 : </div>
              <div className="text-red-500">
                {msToPeriodStrEng(lastCheckTime + oneDayDateNumber - nowTime)}
              </div>
            </div>
          )}
          {selectedId === null ? (
            <div className="project-minting my-4">티켓 구매하기</div>
          ) : (
            <div
              className="project-minting-active my-4"
              onClick={clickPurchaseBtn}
            >
              티켓 구매하기
            </div>
          )}
          <Dialog open={openDialog} onClose={handleClose}>
            <DialogTitle>NFT 구매</DialogTitle>
            <DialogContent>
              <DialogContentText>
                당신은 {count}번의 출석을 하였습니다. 지정하신 {selectedId}번
                NFT는 구매가 가능합니다.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>취소</Button>
              <Button onClick={purchaseTicket}>구매</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
  return (
    <div className="ml-2 text-black" {...restProps}>
      onC ... 로딩중 ...
    </div>
  );
}

export default OneProjectPart;
