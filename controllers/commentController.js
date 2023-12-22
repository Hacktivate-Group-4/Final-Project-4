const { Comment, User, Photo } = require('../models');

class CommentController {
  static async GetAllComments(req, res) {
    try {
      const comments = await Comment.findAll({
        include: [Photo, User],
      });

      if (comments.length === 0) {
        // Tidak ada komentar ditemukan
        res.status(404).json({
          code: 404,
          message: 'Tidak ada komentar yang tersedia.',
        });
      } else {
        // Komentar ditemukan
        res.status(200).json(comments);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async GetOneCommentById(req, res) {
    const { id } = req.params;
    try {
      const comment = await Comment.findByPk(id, {
        include: [User, Photo],
      });

      if (comment) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({
          code: 404,
          message: 'Not Found',
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async UpdateOneCommentById(req, res) {
    const userData = req.UserData;
    console.log(userData.id);

    const { id } = req.params;
    const { comment, PhotoId } = req.body;
    console.log(comment);
    // Validate that required fields are present
    if (!comment || !PhotoId) {
      return res.status(400).json({
        code: 400,
        name: 'required fields not provided!',
        message: 'comment and PhotoId required fields.',
      });
    }

    try {
      const [updatedRowsCount, updatedRows] = await Comment.update(
        { comment, UserId: userData.id, PhotoId },
        { where: { id }, returning: true }
      );

      if (updatedRowsCount > 0) {
        res.status(200).json(updatedRows[0]);
      } else {
        res.status(404).json({
          code: 404,
          message: `Comment with id ${id} not found`,
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async DeleteOneCommentById(req, res) {
    const { id } = req.params;
    try {
      const deletedRowCount = await Comment.destroy({ where: { id } });

      if (deletedRowCount > 0) {
        res.status(200).json({ message: `Comment with id ${id} deleted successfully` });
      } else {
        res.status(404).json({ message: `Comment with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async CreateComment(req, res) {
    const userData = req.UserData;

    const { comment, PhotoId } = req.body;
    // Validate that required fields are present
    if (!comment || !PhotoId) {
      return res.status(400).json({
        code: 400,
        message: 'comment and PhotoId required fields.',
        data: req.body,
      });
    }
    try {
      const newComment = await Comment.create({
        comment,
        UserId: userData.id,
        PhotoId,
      });
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  }
}

module.exports = CommentController;
