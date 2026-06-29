from flask import Flask
from modules.produtos      import produtos_bp
from modules.funcionarios  import funcionarios_bp
from modules.producao      import producao_bp
from modules.metas         import metas_bp
from modules.custos        import custos_bp
from modules.bonus         import bonus_bp
from modules.simulador     import simulador_bp
from modules.vendas        import vendas_bp

app = Flask(__name__)
app.secret_key = "kamao-secret-2025"

app.register_blueprint(produtos_bp,     url_prefix="/produtos")
app.register_blueprint(funcionarios_bp, url_prefix="/funcionarios")
app.register_blueprint(producao_bp,     url_prefix="/producao")
app.register_blueprint(metas_bp,        url_prefix="/metas")
app.register_blueprint(custos_bp,       url_prefix="/custos")
app.register_blueprint(bonus_bp,        url_prefix="/bonus")
app.register_blueprint(simulador_bp,    url_prefix="/simulador")
app.register_blueprint(vendas_bp,       url_prefix="/vendas")

@app.route("/")
def index():
    return "<h1>KA-MÃO — Sistema em construção</h1><p>Banco OK.</p>"

if __name__ == "__main__":
    app.run(debug=True)
    
