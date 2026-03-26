const WorkOrder = require('../models/WorkOrder');

// Get all work orders
exports.getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find();
    res.json(workOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get work order by ID
exports.getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ error: 'Work order not found' });
    res.json(workOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create work order
exports.createWorkOrder = async (req, res) => {
  try {
    const workOrder = new WorkOrder(req.body);
    await workOrder.save();
    res.status(201).json(workOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update work order
exports.updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workOrder) return res.status(404).json({ error: 'Work order not found' });
    res.json(workOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete work order
exports.deleteWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!workOrder) return res.status(404).json({ error: 'Work order not found' });
    res.json({ message: 'Work order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update work order status
exports.updateWorkOrderStatus = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!workOrder) return res.status(404).json({ error: 'Work order not found' });
    res.json(workOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
