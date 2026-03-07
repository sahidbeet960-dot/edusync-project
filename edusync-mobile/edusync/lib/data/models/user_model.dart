enum UserRole { student, cr, professor, admin }

class UserModel {
  final String id;
  final String fullName;
  final UserRole role;
  final String? email;
  final int? semester;
  final String? department;
  final String? avatarUrl;
  final String? bio;
  final DateTime? createdAt;

  final int totalMaterialsUploaded;
  final int totalQuestionsAsked;
  final int totalVerifiedAnswers;
  final int totalStudyMinutes;

  UserModel({
    required this.id,
    required this.fullName,
    required this.role,
    this.email,
    this.semester,
    this.department,
    this.avatarUrl,
    this.bio,
    this.createdAt,
    this.totalMaterialsUploaded = 0,
    this.totalQuestionsAsked = 0,
    this.totalVerifiedAnswers = 0,
    this.totalStudyMinutes = 0,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      fullName: json['full_name'] ?? '',
      role: _parseRole(json['role']),
      email: json['email'],
      semester: json['semester'],
      department: json['department'],
      avatarUrl: json['avatar_url'],
      bio: json['bio'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      totalMaterialsUploaded: json['total_materials_uploaded'] ?? 0,
      totalQuestionsAsked: json['total_questions_asked'] ?? 0,
      totalVerifiedAnswers: json['total_verified_answers'] ?? 0,
      totalStudyMinutes: json['total_study_minutes'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'role': role.name.toUpperCase(),
      };

  static UserRole _parseRole(dynamic role) {
    if (role == null) return UserRole.student;
    final roleStr = role.toString().toLowerCase();
    return UserRole.values.firstWhere(
      (e) => e.name == roleStr,
      orElse: () => UserRole.student,
    );
  }

  bool get isAdmin => role == UserRole.admin;
  bool get isProfessor => role == UserRole.professor;
  bool get isCR => role == UserRole.cr;
  bool get canVerify => isProfessor || isCR || isAdmin;
  bool get canCreateEvents => isCR || isProfessor || isAdmin;

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    UserRole? role,
    int? semester,
    String? department,
    String? avatarUrl,
    String? bio,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      semester: semester ?? this.semester,
      department: department ?? this.department,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      createdAt: createdAt,
      totalMaterialsUploaded: totalMaterialsUploaded,
      totalQuestionsAsked: totalQuestionsAsked,
      totalVerifiedAnswers: totalVerifiedAnswers,
      totalStudyMinutes: totalStudyMinutes,
    );
  }
}
