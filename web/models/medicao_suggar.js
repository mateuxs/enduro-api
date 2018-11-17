module.exports = function (Sequelize, DataTypes) {
	var medicao_suggar = Sequelize.define("medicao_suggar", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		consumo: DataTypes.REAL,
		datahora: DataTypes.DATEONLY,
		corrente_medidor_1: DataTypes.REAL,
		corrente_medidor_2: DataTypes.REAL,
		corrente_medidor_3: DataTypes.REAL,
		tensao: DataTypes.REAL
	}, {
		timestamps: false,
		tableName: 'historico_suggar',
		underscored: true,
		classMethods: {
		}
	});
	return medicao_suggar;
};