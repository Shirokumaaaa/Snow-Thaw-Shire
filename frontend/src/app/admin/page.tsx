"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type LoginState = {
  username: string;
  password: string;
};

export default function AdminPage() {
  const [login, setLogin] = useState<LoginState>({ username: "", password: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [token, setToken] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  const handleLogin = async () => {
    setStatus("");
    const body = new URLSearchParams();
    body.set("username", login.username);
    body.set("password", login.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      setStatus("登录失败，请检查账号密码。");
      return;
    }

    const data = await response.json();
    const newToken = data.access_token as string;
    setToken(newToken);
    window.localStorage.setItem("admin_token", newToken);
    setStatus("登录成功。");
  };

  const handleUpload = async () => {
    if (!token) {
      setStatus("请先登录。");
      return;
    }

    if (!files.length) {
      setStatus("请先选择要上传的txt文件。");
      return;
    }

    setStatus("");
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE}/admin/cards/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      setStatus("上传失败，请检查接口或权限。");
      return;
    }

    const data = await response.json();
    setFiles([]);
    setStatus(`上传成功，共 ${data.inserted ?? 0} 条。`);
  };

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("admin_token");
    setStatus("已退出登录。");
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>管理端</h1>
        <p className={styles.subtitle}>管理员登录后可上传文章内容</p>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>管理员登录</h2>
          <label className={styles.label}>
            账号
            <input
              className={styles.input}
              value={login.username}
              onChange={(event) => setLogin({ ...login, username: event.target.value })}
              placeholder="admin"
            />
          </label>
          <label className={styles.label}>
            密码
            <input
              className={styles.input}
              type="password"
              value={login.password}
              onChange={(event) => setLogin({ ...login, password: event.target.value })}
              placeholder="admin123"
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={handleLogin}>
              登录
            </button>
            <button className={styles.ghost} type="button" onClick={handleLogout}>
              退出
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>上传txt文件</h2>
          <label className={styles.label}>
            选择文件（可多选）
            <input
              className={styles.input}
              type="file"
              accept=".txt"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
          </label>
          {files.length ? (
            <div className={styles.fileList}>
              {files.map((file) => (
                <div key={file.name} className={styles.fileItem}>
                  {file.name}
                </div>
              ))}
            </div>
          ) : null}
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={handleUpload}>
              上传
            </button>
          </div>
        </div>
      </section>

      {status ? <p className={styles.status}>{status}</p> : null}
      <p className={styles.hint}>API: {API_BASE}</p>
    </main>
  );
}
