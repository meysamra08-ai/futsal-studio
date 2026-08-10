//import { useState } from "react";
import "./Login.css";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  //const [email, setEmail] = useState("");
  //const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // فعلاً ورود واقعی نداریم.
    // در مرحله فروش، این قسمت به سیستم License / Activation وصل می‌شود.
    onLogin();
  };

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-hero">

          {/* 
            لوگو را بعداً خیلی راحت می‌توانی عوض کنی.
            
            کافی است فایل لوگو را داخل:
            
            public/logo/
            
            قرار بدهی و مقدار src را تغییر بدهی.
          */}

          <img
            className="login-logo"
            src="/logo/coach-studio-logo.png"
            alt="Coach Studio"
          />

          <h1>
            MEYSAM <span>RAMEZANI</span>
          </h1>

          <p>Plan. Coach. Win.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>

        

          <button
            type="submit"
            className="login-button"
          >
            ورود
          </button>

        </form>

        <div className="login-divider">
          <span>یا</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={onLogin}
        >
          <span className="google-icon">G</span>
          ورود با گوگل
        </button>

        <div className="register-text">
          حساب کاربری ندارید؟
          <button type="button">
            ایجاد حساب
          </button>
        </div>

      </section>
    </main>
  );
}