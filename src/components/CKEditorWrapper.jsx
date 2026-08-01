"use client";

import { useEffect, useRef, useState } from "react";

export default function CKEditorWrapper({ value, onChange }) {
  const editorRef = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  useEffect(() => {
    editorRef.current = {
      CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
      ClassicEditor: require("@ckeditor/ckeditor5-build-classic"),
    };
    setEditorLoaded(true);
  }, []);

  if (!editorLoaded) {
    return (
      <div className="p-3 border rounded text-muted bg-light">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          placeholder: "Nhập nội dung bài viết chi tiết tại đây...",
        }}
      />
    </div>
  );
}