import 'package:flutter/material.dart';
import '../../../data/models/material_model.dart';
import '../../../data/repositories/material_repository.dart';

class MaterialsViewModel extends ChangeNotifier {
  final MaterialRepository _repo = MaterialRepository();

  bool _isLoading = false;
  bool _hasLoaded = false;
  bool _isUploading = false;
  List<MaterialModel> _materials = [];
  String? _error;
  int? _selectedSemester;
  String _searchQuery = '';

  bool get isLoading => _isLoading;
  bool get isUploading => _isUploading;
  List<MaterialModel> get materials => _materials;
  String? get error => _error;
  int? get selectedSemester => _selectedSemester;

  List<MaterialModel> get filteredMaterials {
    return _materials.where((m) {
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!m.title.toLowerCase().contains(query) &&
            !(m.description?.toLowerCase().contains(query) ?? false) &&
            !(m.tags?.toLowerCase().contains(query) ?? false)) {
          return false;
        }
      }

      if (_selectedSemester != null && m.semester != _selectedSemester) {
        return false;
      }

      return true;
    }).toList();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSemester(int? semester) {
    _selectedSemester = semester;
    loadMaterials(forceRefresh: true);
  }

  Future<void> loadMaterials({bool forceRefresh = false}) async {
    if (_hasLoaded && !forceRefresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _materials = await _repo.getMaterials(
        semester: _selectedSemester,
      );
      _hasLoaded = true;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Upload material via multipart form data
  Future<bool> uploadMaterial({
    required String title,
    required List<int> fileBytes,
    required String fileName,
    String? description,
    required int semester,
    String? tags,
  }) async {
    _isUploading = true;
    notifyListeners();

    try {
      await _repo.createMaterial(
        title: title,
        fileBytes: fileBytes,
        fileName: fileName,
        description: description,
        semester: semester,
        tags: tags,
      );
      // Since backend might return a string, we reload the materials to get the actual created item.
      await loadMaterials(forceRefresh: true);
      _isUploading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isUploading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify a material (Professor/CR/Admin only)
  Future<bool> verifyMaterial(String id) async {
    try {
      final updated = await _repo.verifyMaterial(id);
      final idx = _materials.indexWhere((m) => m.id == id);
      if (idx != -1) {
        _materials[idx] = updated;
      }
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Unverify a material (Professor/CR/Admin only)
  Future<bool> unverifyMaterial(String id) async {
    try {
      final updated = await _repo.unverifyMaterial(id);
      final idx = _materials.indexWhere((m) => m.id == id);
      if (idx != -1) {
        _materials[idx] = updated;
      }
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Delete a material
  Future<bool> deleteMaterial(String id) async {
    try {
      await _repo.deleteMaterial(id);
      _materials.removeWhere((m) => m.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
