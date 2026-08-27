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

  return (
    <div
      className={
        isAndroid
          ? "main-layout android-layout"
          : "main-layout"
      }
    >

      {/* =================================================
          Header
          ================================================= */}

      <header className="main-layout__header">
        <Header />
      </header>


      {/* =================================================
          Sidebar
          فقط Web / Windows
          ================================================= */}

      {!isAndroid && (
        <aside className="main-layout__sidebar">
          <Sidebar />
        </aside>
      )}


      {/* =================================================
          Court
          ================================================= */}

      <main className="main-layout__court">
        <CourtCanvas />
      </main>


      {/* =================================================
          Right Panel
          فقط Web / Windows
          ================================================= */}

      {!isAndroid && (
        <aside className="main-layout__right-panel">
          <RightPanel />
        </aside>
      )}


      {/* =================================================
          Android Bottom Tool Panel
          فقط Android
          ================================================= */}

      {isAndroid && (
        <AndroidToolPanel />
      )}

    </div>
  );
}