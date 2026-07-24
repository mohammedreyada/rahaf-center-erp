const { getIO } = require('../config/socket');

exports.emitNewSale = (saleData) => {
  try {
    const io = getIO();
    // بيبعت لكل المدراء والأدمن إن فيه عملية بيع جديدة
    io.to('role_admin').to('role_manager').emit('new_sale', saleData);
  } catch (error) {
    console.error('Socket Sale Error:', error);
  }
};