import React, { useState, useRef, useEffect } from "react";
import { Mail, MapPin, Phone, ChevronDown, Loader2, X } from "lucide-react";
import UploadZone from "./UploadZone";
import { uploadToCloudinary } from "./../utils/Cloudinary";

const services = [
  "Business Consultation",
  "Credit Restoration",
  "Tax Preparation",
  "General Inquiry",
  "Payroll Services",
];

const contactMethods = ["Email", "Phone"];

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-3 text-white border border-transparent rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue hover:bg-white/30"
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white shadow-lg max-h-60 backdrop-blur-md rounded-xl">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="p-3 cursor-pointer hover:bg-gray-200"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const employeeRanges = ["1-10", "11-25", "26-50", "51-100", "100+"];
const payrollOptions = ["Payroll", "Health Insurance", "401(k)", "Vision/Dental"];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    contactMethod: "",
    companyName: "",
    numEmployees: "",
    interests: [] as string[],
    uploadedFiles: [] as string[],
  });

  const [showPayrollFields, setShowPayrollFields] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (value: string) => {
    setFormData({ ...formData, service: value });
    setShowPayrollFields(value === "Payroll Services");
  };

  const handleInterestChange = (option: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(option)
        ? formData.interests.filter((i) => i !== option)
        : [...formData.interests, option],
    });
  };

  const handleFilesUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const newFiles: File[] = [];
    
    for (const file of files) {
      const isDuplicate = uploadedFiles.some(
        uploadedFile => 
          uploadedFile.name === file.name && 
          uploadedFile.size === file.size && 
          uploadedFile.lastModified === file.lastModified
      );
      
      if (!isDuplicate) {
        newFiles.push(file);
      }
    }
    
    if (newFiles.length === 0) {
      setIsUploading(false);
      return;
    }
    
    const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
    let uploadedSize = 0;
    const urls: string[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      try {
        const url = await uploadToCloudinary(newFiles[i], (fileProgress) => {
          const fileWeight = newFiles[i].size / totalSize;
          const currentFileProgress = (fileProgress / 100) * fileWeight;
          uploadedSize += newFiles[i].size * (fileProgress / 100);
          
          if (i > 0) {
            const previousFilesProgress = newFiles
              .slice(0, i)
              .reduce((acc, file) => acc + file.size, 0) / totalSize;
            setUploadProgress(Math.round((previousFilesProgress + currentFileProgress) * 100));
          } else {
            setUploadProgress(Math.round(currentFileProgress * 100));
          }
        });
        
        urls.push(url);
      } catch (error) {
        console.error(`Failed to upload ${newFiles[i].name}:`, error);
        alert(`Failed to upload ${newFiles[i].name}. Please try again or use a different file.`);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadedUrls(prev => [...prev, ...urls]);
    setIsUploading(false);
    
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setUploadedUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.service || !formData.message || !formData.contactMethod) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          uploadedFiles: uploadedUrls
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          service: "",
          message: "",
          contactMethod: "",
          companyName: "",
          numEmployees: "",
          interests: [],
          uploadedFiles: [],
        });
        setUploadedFiles([]);
        setUploadedUrls([]);
        setShowPayrollFields(false);
        alert("Form submitted successfully! We will reach out to you soon.");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tag = "Contact us";

  return (
    <section className="flex flex-col-reverse gap-6 pt-16 my-6 bg-brandBlueLight50 mde:py-20 lg:border lg:mx-4 lg:rounded-3xl lg:flex-row md:gap-10 2xl:gap-24 font-bricolage">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 gap-4 px-6 py-12 bg-royalBlue lg:p-12 lg:ml-12 lg:rounded-3xl"
      >
        <p className="text-white/70">Fill the form below</p>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="p-3 text-white border border-transparent rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue hover:bg-white/30"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="p-3 text-white border border-transparent rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue hover:bg-white/30"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="p-3 text-white border border-transparent rounded-xl bg-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue hover:bg-white/30"
          required
        />

        <CustomDropdown
          options={services}
          value={formData.service}
          onChange={handleServiceChange}
          placeholder="Service Interest"
        />

        <div
          className={`transition-all duration-500 ${
            showPayrollFields ? "max-h-[500px]" : "max-h-0 overflow-hidden"
          }`}
        >
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full p-3 mb-4 text-white border border-transparent rounded-xl bg-white/20 focus:outline-none focus:ring-2 hover:bg-white/30 focus:ring-brandBlue"
          />

          <CustomDropdown
            options={employeeRanges}
            value={formData.numEmployees}
            onChange={(value) =>
              setFormData({ ...formData, numEmployees: value })
            }
            placeholder="Number of Employees"
          />

          <div className="mt-4">
            <p className="mb-4 text-white">I'm Interested In (optional):</p>

            <div className="flex flex-wrap gap-2">
              {payrollOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 text-white transition cursor-pointer bg-white/20 rounded-xl hover:bg-white/30"
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(option)}
                    onChange={() => handleInterestChange(option)}
                    className="w-4 h-4 accent-brandBlue"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>

        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          className="h-32 p-3 text-white border border-transparent resize-none rounded-xl bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-brandBlue"
          required
        />

        <CustomDropdown
          options={contactMethods}
          value={formData.contactMethod}
          onChange={(value) =>
            setFormData({ ...formData, contactMethod: value })
          }
          placeholder="Preferred Contact Method"
        />

        <UploadZone
          files={uploadedFiles}
          onFilesChange={handleFilesUpload}
          maxSizeMB={10}
        />

        {/* {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between w-full max-w-full p-3 overflow-hidden border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-gray-800 truncate w-full max-w-[240px] xs:max-w-[350px] md:max-w-[390px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-2 rounded-full hover:bg-red-100"
                  type="button"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )} */}

        {isUploading && (
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-sm text-white">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 overflow-hidden rounded-full bg-white/20">
              <div 
                className="h-full transition-all duration-300 bg-green-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="flex items-center justify-center gap-2 px-6 py-3 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </form>

      <div className="flex flex-col justify-center flex-1 gap-4 px-6 mb-6 md:px-12 md:mb-0">
        <p className="px-3 py-1 text-sm font-semibold tracking-wide rounded-full text-brandGray500 md:text-base bg-brandBlueLight100 w-fit">
          {tag}
        </p>

        <h2 className="mb-6 text-3xl font-semibold leading-tight md:text-4xl text-brandGray900">
          Get in Touch With Us
        </h2>

        <p className="text-brandGray900">
          Ready to send your request? Drop a message, upload attachments,
          choose your preferred contact method — and our system will route
          everything securely.
        </p>

        <div className="flex flex-col gap-3 mt-4 text-brandGray900">
          <a
            href="https://maps.example.com/a8H2#kL9pFQX!37@zR"
            className="flex items-center gap-3 py-2 border-b hover:underline border-brandGray500/20"
          >
            <span className="p-2 rounded-full bg-brandBlueLight100">
              <MapPin size={18} />
            </span>
            <span>
              9uA-44B, fR#Kx-v91 Sector B-22, QyL District, ZZ-10923
            </span>
          </a>

          <a
            href="tel:+9918847220183"
            className="flex items-center gap-3 py-2 border-b border-brandGray500/20 hover:underline"
          >
            <span className="p-2 rounded-full bg-brandBlueLight100">
              <Phone size={18} />
            </span>
            <span>+99 (188) 472-20183</span>
          </a>

          <a
            href="mailto:support.ZxA12!core@xmpl-srv.io"
            className="flex items-center gap-3 py-2 border-b border-brandGray500/20 hover:underline"
          >
            <span className="p-2 rounded-full bg-brandBlueLight100">
              <Mail size={18} />
            </span>
            <span>support.ZxA12!core@xmpl-srv.io</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;