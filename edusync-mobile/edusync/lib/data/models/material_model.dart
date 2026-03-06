class MaterialModel {
  final String id;
  final String title;
  final String? description;
  final String fileUrl;
  final String uploaderId;
  final int? semester;
  final String? tags;
  final bool isVerified;
  final String? verifiedById;
  final DateTime? createdAt;

  MaterialModel({
    required this.id,
    required this.title,
    this.description,
    required this.fileUrl,
    required this.uploaderId,
    this.semester,
    this.tags,
    this.isVerified = false,
    this.verifiedById,
    this.createdAt,
  });

  factory MaterialModel.fromJson(Map<String, dynamic> json) {
    return MaterialModel(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      description: json['description'],
      fileUrl: json['file_url'] ?? '',
      uploaderId: json['uploader_id'].toString(),
      semester: json['semester'],
      tags: json['tags'],
      isVerified: json['is_verified'] ?? false,
      verifiedById: json['verified_by_id']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'file_url': fileUrl,
        'semester': semester,
        'tags': tags,
      };

  /// Get tags as a list for display
  List<String> get tagList {
    if (tags == null || tags!.isEmpty) return [];
    return tags!.split(',').map((t) => t.trim()).where((t) => t.isNotEmpty).toList();
  }

  /// Safely extracts the file extension or returns a generic label for web links
  String get fileExtension {
    try {
      final uri = Uri.parse(fileUrl);
      if (uri.pathSegments.isNotEmpty) {
        final lastSegment = uri.pathSegments.last;
        if (lastSegment.contains('.')) {
          final ext = lastSegment.split('.').last.toUpperCase();
          // Only accept standard, short file extensions
          if (ext.length <= 4 && RegExp(r'^[A-Z0-9]+$').hasMatch(ext)) {
            return ext;
          }
        }
      }
      
      // Smart fallbacks for web links
      if (fileUrl.contains('drive.google.com')) return 'DRIVE';
      if (fileUrl.contains('dropbox.com')) return 'DROPBOX';
      if (fileUrl.contains('youtube.com') || fileUrl.contains('youtu.be')) return 'VIDEO';
      
      return 'LINK';
    } catch (_) {
      return 'FILE';
    }
  }
}