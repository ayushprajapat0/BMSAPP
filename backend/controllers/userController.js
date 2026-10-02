import bcrypt from "bcrypt";
import User from "../models/Users.js";

const generateUserId = async (role) => {
  const prefix = role === "DRIVER" ? "D" : "T";

  while (true) {
    const number = Math.floor(Math.random() * 99) + 1;
    const userId = `${prefix}${String(number).padStart(2, "0")}`;

    const existingUser = await User.findOne({ userId });

    if (!existingUser) {
      return userId;
    }
  }
};

export const registerTransportManager = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const userId = await generateUserId("TRANSPORT_MANAGER");
    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await User.create({
      userId,
      name,
      phone,
      password: hashedPassword,
      role: "TRANSPORT_MANAGER",
      isActive: true,
      mustChangePassword: false,
      createdBy: null,
    });

    return res.status(201).json({
      success: true,
      message: "Transport manager registered successfully",
      data: {
        userId: manager.userId,
        name: manager.name,
        phone: manager.phone,
        role: manager.role,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to register transport manager",
    });
  }
};

export const updateTransportManager = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, password, isActive } = req.body;

    const manager = await User.findOne({
      userId,
      role: "TRANSPORT_MANAGER",
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Transport manager not found",
      });
    }

    if (name !== undefined) {
      manager.name = name;
    }

    if (phone !== undefined) {
      const phoneExists = await User.findOne({
        phone,
        userId: { $ne: userId },
      });

      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }

      manager.phone = phone;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      manager.password = await bcrypt.hash(password, 10);
    }

    if (isActive !== undefined) {
      manager.isActive = isActive;
    }

    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Transport manager updated successfully",
      data: {
        userId: manager.userId,
        name: manager.name,
        phone: manager.phone,
        role: manager.role,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update transport manager",
    });
  }
};

export const deleteTransportManager = async (req, res) => {
  try {
    const { userId } = req.params;

    const manager = await User.findOne({
      userId,
      role: "TRANSPORT_MANAGER",
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Transport manager not found",
      });
    }

    manager.isActive = false;
    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Transport manager deactivated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete transport manager",
    });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const managerId = req.user.userId;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const userId = await generateUserId("DRIVER");
    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await User.create({
      userId,
      name,
      phone,
      password: hashedPassword,
      role: "DRIVER",
      isActive: true,
      mustChangePassword: true,
      createdBy: managerId,
    });

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: {
        userId: driver.userId,
        name: driver.name,
        phone: driver.phone,
        role: driver.role,
        isActive: driver.isActive,
        mustChangePassword: driver.mustChangePassword,
        createdBy: driver.createdBy,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create driver",
    });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, password, isActive } = req.body;

    const driver = await User.findOne({
      userId,
      role: "DRIVER",
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (name !== undefined) {
      driver.name = name;
    }

    if (phone !== undefined) {
      const phoneExists = await User.findOne({
        phone,
        userId: { $ne: userId },
      });

      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }

      driver.phone = phone;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      driver.password = await bcrypt.hash(password, 10);
      driver.mustChangePassword = true;
    }

    if (isActive !== undefined) {
      driver.isActive = isActive;
    }

    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: {
        userId: driver.userId,
        name: driver.name,
        phone: driver.phone,
        role: driver.role,
        isActive: driver.isActive,
        mustChangePassword: driver.mustChangePassword,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver",
    });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { userId } = req.params;

    const driver = await User.findOne({
      userId,
      role: "DRIVER",
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.isActive = false;
    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Driver deactivated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete driver",
    });
  }
};
export const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: "DRIVER",
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
    });
  }
};

export const getDriver = async (req, res) => {
  try {
    const { userId } = req.params;

    const driver = await User.findOne({
      userId,
      role: "DRIVER",
    }).select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
    });
  }
};

export const getTransportManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: "TRANSPORT_MANAGER",
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transport managers",
    });
  }
};

export const getTransportManager = async (req, res) => {
  try {
    const { userId } = req.params;

    const manager = await User.findOne({
      userId,
      role: "TRANSPORT_MANAGER",
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Transport manager not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transport manager",
    });
  }
};