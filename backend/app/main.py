from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import router as v1_router

# Interactive API docs expose the full endpoint/schema surface. Keep them on for
# local/demo environments (same flag that gates demo auth), off in real
# deployments so the API surface isn't publicly enumerable.
_docs_enabled = settings.demo_login_enabled

app = FastAPI(
    title="Winnify API",
    version="1.0.0",
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    openapi_url="/openapi.json" if _docs_enabled else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://web-winnify.vercel.app",
        "http://10.128.20.150:5173",
        "http://10.128.22.69:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Secondary dev/preview instance (Claude Code preview) — 5173 stays
        # the primary dev port.
        "http://localhost:5199",
        "http://127.0.0.1:5199",
    ],
    # This project's own Vercel deployments only — the production domains plus
    # their preview builds (<project>-<hash|git-branch>-<scope>.vercel.app).
    # Scoped to the known project prefixes (`web-winnify`, `winteach`) so an
    # unrelated attacker-controlled *.vercel.app site cannot make credentialed
    # cross-origin requests.
    # Also allows any private-LAN IP on any port (http) so phones and tablets on
    # the same Wi-Fi can reach the dev server — the three RFC-1918 ranges (10.x,
    # 172.16–31.x, 192.168.x) plus loopback.
    allow_origin_regex=(
        r"https://(?:web-winnify|winteach)(?:-[a-z0-9-]+)?\.vercel\.app"
        r"|http://(?:localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}"
        r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
        r"|192\.168\.\d{1,3}\.\d{1,3}"
        r"|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):\d+"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # lets the frontend read export filenames
)

app.include_router(v1_router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
