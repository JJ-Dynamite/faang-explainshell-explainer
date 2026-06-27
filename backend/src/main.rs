use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct CommandExplanation {
    command: String,
    description: String,
    components: Vec<CommandComponent>,
    examples: Vec<String>,
    related_commands: Vec<String>,
    man_page_url: String,
}

#[derive(Serialize)]
struct CommandComponent {
    part: String,
    meaning: String,
}

#[derive(Deserialize)]
struct ExplainRequest {
    command: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Understand any terminal command".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn explain_command(Json(req): Json<ExplainRequest>) -> impl IntoResponse {
    let explanation = CommandExplanation {
        command: req.command.clone(),
        description: format!("This command performs the following operation: {}", req.command),
        components: vec![
            CommandComponent {
                part: req.command.split_whitespace().next().unwrap_or("").to_string(),
                meaning: "The base command name".to_string(),
            },
            CommandComponent {
                part: "-rf".to_string(),
                meaning: "Force recursive flag".to_string(),
            },
            CommandComponent {
                part: "/path/*".to_string(),
                meaning: "Target path with wildcard".to_string(),
            },
        ],
        examples: vec![
            format!("{} --help", req.command.split_whitespace().next().unwrap_or("")),
            format!("{} -v", req.command.split_whitespace().next().unwrap_or("")),
        ],
        related_commands: vec![
            "ls".to_string(),
            "find".to_string(),
            "which".to_string(),
        ],
        man_page_url: format!("https://man7.org/linux/man-pages/man1/{}.1.html", req.command.split_whitespace().next().unwrap_or("")),
    };

    Json(ApiResponse {
        success: true,
        data: Some(explanation),
        error: None,
    })
}

async fn get_safe_commands() -> impl IntoResponse {
    let commands = vec![
        serde_json::json!({ "command": "ls", "description": "List directory contents", "risk": "Safe" }),
        serde_json::json!({ "command": "cat", "description": "Display file contents", "risk": "Safe" }),
        serde_json::json!({ "command": "grep", "description": "Search text patterns", "risk": "Safe" }),
        serde_json::json!({ "command": "rm -rf", "description": "Remove files/directories", "risk": "Dangerous" }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(commands),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_commands": 12345,
            "explanations_served": 8901234,
            "avg_satisfaction": 4.8,
            "commands_documented": 5678
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/explain", post(explain_command))
        .route("/api/safe-commands", get(get_safe_commands))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Understand any terminal command backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
