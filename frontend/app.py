import streamlit as st
import requests

st.set_page_config(page_title="AI Resume Enhancer", layout="wide")
st.title("🧠 AI Resume Bullet Point Enhancer")

job_description = st.text_area("Paste the job description here", height=200)
resume_bullet = st.text_area("Paste your resume bullet point here", height=100)

if st.button("Enhance Bullet"):
    if not job_description or not resume_bullet:
        st.warning("Please provide both the job description and a resume bullet.")
    else:
        with st.spinner("Enhancing your bullet point..."):
            res = requests.post(
                "http://localhost:8000/enhance",
                json={"job_description": job_description, "bullet": resume_bullet},
            )
            if res.ok:
                enhanced = res.json()["enhanced"]
                st.success("Enhanced bullet point:")
                st.code(enhanced, language="markdown")
            else:
                st.error("Something went wrong with the backend.")
