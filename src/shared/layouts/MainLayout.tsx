import { useState } from "react";
import { Capacitor } from "@capacitor/core";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import CourtCanvas from "../../components/Court/CourtCanvas";
import RightPanel from "../../components/RightPanel/RightPanel";
import AndroidToolPanel from "../../components/AndroidToolPanel/AndroidToolPanel";

import "./MainLayout.css";

export default function MainLayout() {
  /*
   * =====================================================
   * تشخیص Android
   * =====================================================
   *
   * در Android:
   * - منوی سمت چپ حذف می‌شود
   * - پنل سمت راست حذف می‌شود
   * - پنل پایین Android نمایش داده می‌شود
   *
   * Web و Windows دست‌نخورده باقی می‌مانند.
   */

  const platform = Capacitor.getPlatform();

  const isAndroid =
    platform === "android" ||
    /Android/i.test(navigator.userAgent);

  /*
   * مدیریت انیمیشن فقط یک حالت Layout است.
   * در حالت عادی false است و هیچ تغییری در Layout فعلی ایجاد نمی‌کند.
   */
  const [isAnimationManagementOpen, setIsAnimationManagementOpen] =
    useState(false);

  const managementLayoutStyle = !isAndroid && isAnimationManagementOpen
    ? {
        gridTemplateColumns: "minmax(0, 1fr)",
        gridTemplateRows: "minmax(0, 1fr)",
        overflow: "hidden" as const,
        width: "100%",
        height: "100vh",
        minWidth: 0,
        minHeight: 0,
        background: "#0B1420",
        maxHeight: "100vh",
      }
    : undefined;

  return (
    <div
      className={
        isAndroid
          ? "main-layout android-layout"
          : isAnimationManagementOpen
            ? "main-layout animation-management-layout"
            : "main-layout"
      }
      style={managementLayoutStyle}
    >
      {/* =================================================
          Header
          ================================================= */}

      {!isAnimationManagementOpen && (
        <header className="main-layout__header">
          <Header />
        </header>
      )}

      {/* =================================================
          Sidebar
          فقط Web / Windows
          ================================================= */}

      {!isAndroid && !isAnimationManagementOpen && (
        <aside className="main-layout__sidebar">
          <Sidebar />
        </aside>
      )}

      {/* =================================================
          Court
          ================================================= */}

      {!isAnimationManagementOpen && (
        <main className="main-layout__court">
          <CourtCanvas />
        </main>
      )}

      {/* =================================================
          Right Panel
          فقط Web / Windows
          ================================================= */}

      {!isAndroid && (
        <aside
          className="main-layout__right-panel"
          style={
            isAnimationManagementOpen
              ? {
                  gridColumn: "1",
                  gridRow: "1",
                  display: "flex",
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "hidden",
                  border: 0,
                  boxShadow: "none",
                }
              : undefined
          }
        >
          <RightPanel
            isAnimationManagementOpen={isAnimationManagementOpen}
            onOpenAnimationManagement={() =>
              setIsAnimationManagementOpen(true)
            }
            onCloseAnimationManagement={() =>
              setIsAnimationManagementOpen(false)
            }
          />
        </aside>
      )}

      {/* =================================================
          Android Bottom Tool Panel
          فقط Android
          ================================================= */}

      {isAndroid && <AndroidToolPanel />}
    </div>
  );
}
